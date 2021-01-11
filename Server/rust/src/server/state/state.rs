use crate::error::GenericResult;
use crate::error::GenericError;
use crate::error::ErrorKind;

use std::convert::TryFrom;

use crate::server::entity::entity::Entity;

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
        for (_, player) in self.players.iter_mut()
        {
            player.tick(dt);
            player.attempt_movement(&self.map, dt);
        }

        if let Ok(_event) = self.event_listener.try_recv()
        {
            self.map = super::super::process::get_map(self.conn.clone(), &self.opts).await?;
        }

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
        tokio::spawn(async move {conn.set_value("gamedata", "player", json_data).await});

        Ok(())
    }
}