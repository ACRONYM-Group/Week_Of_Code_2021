use crate::error::GenericResult;
use crate::error::GenericError;
use crate::error::ErrorKind;

use std::convert::TryFrom;

use crate::server::entity::entity::Entity;
use crate::server::entity::Player;

use std::collections::HashMap;

/// State of the game
pub struct GameState
{
    pub conn: std::sync::Arc<aci::Connection>,
    pub map: crate::server::map::Map,
    pub players: HashMap<String, crate::server::entity::Player>,
    pub event_listener: tokio::sync::mpsc::Receiver<aci::event::ACIEvent>,
    pub opts: crate::args::Arguments
}

// General Game State functions
impl GameState
{
    /// Create a new game state object from a connection and a map
    pub async fn new(conn: std::sync::Arc<aci::Connection>, map: crate::server::map::Map, event_listener: tokio::sync::mpsc::Receiver<aci::event::ACIEvent>, options: crate::args::Arguments) -> GenericResult<Self>
    {
        // Read the position of the player from the server
        debug!("Loading player data from the server");
        let player_data = conn.get_value("gamedata", "playerdata").await?;

        let players = if let serde_json::Value::Object(map) = player_data
        {
            let mut players = HashMap::new();

            for (k, v) in map
            {
                let player = crate::server::entity::Player::try_from(v).map_err(|e| GenericError::new(e, ErrorKind::ParsingError))?;
                players.insert(k, player);
            }

            players
        }
        else
        {
            return Err(GenericError::new(format!("Player data from the server is not an object"), ErrorKind::ParsingError));
        };

        Ok(
            GameState
            {
                conn, map, players, event_listener,
                opts: options
            }
        )
    }

    /// Update the game state
    pub async fn tick(&mut self, dt: f64) -> GenericResult<()>
    {
        // Tick and move every player
        for (_, player) in self.players.iter_mut()
        {
            player.tick(dt);
            player.attempt_movement(&self.map, dt);
        }

        // Handle any incoming events
        self.check_for_events().await?;

        Ok(())
    }

    /// Generate json for the player data
    fn generate_player_json(&self) -> GenericResult<serde_json::Value>
    {
        let mut player_data_hashmap = HashMap::new();

        for (key, player) in &self.players
        {
            let json_data = serde_json::Value::try_from(player).map_err(|e| GenericError::new(e, ErrorKind::ParsingError))?;
            player_data_hashmap.insert(key.clone(), json_data);
        }

        Ok(json!(player_data_hashmap))
    }

    /// Send the data back to the server
    pub async fn send_to_server(&self) -> GenericResult<()>
    {
        let json_data = self.generate_player_json()?;
        let conn = self.conn.clone();

        // Spawn a seperate async process to send the data back to the server
        tokio::spawn(async move {conn.set_value("gamedata", "playerdata", json_data).await});

        Ok(())
    }
}

// Event Handling Functions
impl GameState
{
    /// Handle any recieved events if an event has been recieved (will not block)
    async fn check_for_events(&mut self) -> GenericResult<()>
    {
        match self.event_listener.try_recv()
        {
            Ok(event) =>
            {
                let origin = event.source.clone();
    
                // Ensure the event has a json object as its data value
                if let serde_json::Value::Object(event_data) = event.consume()
                {
                    // Ensure the event type is a string
                    if let Some(serde_json::Value::String(event_type)) = event_data.get("type")
                    {
                        match event_type.as_str()
                        {
                            // Type: reload | Reloads the map from the database, may take several seconds
                            "reload" =>
                            {
                                self.reload_map(event_data).await?;
                            },
    
                            // Type: move | Moves a player
                            "move" =>
                            {
                                self.movement_update(event_data).await?;
                            },

                            // Type: join | Connects a new player
                            "join" =>
                            {
                                self.add_player(event_data).await?;
                            }
    
                            // Display an error message if the event is not recognized
                            default => warn!("Unknown event type `{}` from `{}`", default, origin)
                        }
                    }
                    else
                    {
                        warn!("Unable to extract event type from event recieved from `{}`", origin);
                    }
                }
                else
                {
                    warn!("Recieved event from `{}` which is not an object", origin);
                }
            },
            Err(tokio::sync::mpsc::error::TryRecvError::Closed) =>
            {
                error!("Event listener has closed");
            },
            _ => {}
        }

        Ok(())
    }

    /// Reload the map from the server (may take several seconds)
    async fn reload_map(&mut self, _data: serde_json::Map<String, serde_json::Value>) -> GenericResult<()>
    {
        self.map = super::super::process::get_map(self.conn.clone(), &self.opts).await?;

        Ok(())
    }

    /// React to a movement packet by updating a character's velocity
    async fn movement_update(&mut self, data: serde_json::Map<String, serde_json::Value>) -> GenericResult<()>
    {
        if let Some(serde_json::Value::String(name)) = data.get("name")
        {
            if let Some(serde_json::Value::Array(vel)) = data.get("vel")
            {
                if vel.len() >= 2
                {
                    if let (serde_json::Value::Number(x), serde_json::Value::Number(y)) = (&vel[0], &vel[1])
                    {
                        if let (Some(mut x), Some(mut y)) = (x.as_f64(), y.as_f64())
                        {
                            // Get the magnitude of the velocity vector
                            let mag = (x*x + y*y).powf(0.5);

                            // If the vector is not zero, normalize the velocity vector
                            if mag != 0.0
                            {
                                x /= mag;
                                y /= mag;
                            }

                            // If the player is in the player database
                            if let Some(player) = self.players.get_mut(name)
                            {
                                player.velocity.x = x;
                                player.velocity.y = y;
                            }
                            else
                            {
                                warn!("Cannot update velocity of player `{}`, not found", name);
                            }
                        }
                        else
                        {
                            warn!("Unable to extract floats from velocity in movement packet");
                        }
                    }
                    else
                    {
                        warn!("Velocity values are not numbers in movement packet");
                    }
                }
                else
                {
                    warn!("Velocity is not a 2 index array in movement packet");
                }
            }
            else
            {
                warn!("Unable to extract array `vel` from movement packet");
            }
        }
        else
        {
            warn!("Unable to extract string `name` from movement packet");
        }

        Ok(())
    }

    /// Add a new player packet
    async fn add_player(&mut self, data: serde_json::Map<String, serde_json::Value>) -> GenericResult<()>
    {
        if let Some(serde_json::Value::String(name)) = data.get("name")
        {
            self.players.insert(name.clone(), Player::new());
        }

        Ok(())
    }
}