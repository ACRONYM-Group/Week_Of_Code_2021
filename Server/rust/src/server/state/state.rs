use crate::error::GenericResult;
use crate::error::GenericError;
use crate::error::ErrorKind;

use std::convert::TryFrom;

use crate::server::entity::entity::Entity;

/// State of the game
pub struct GameState
{
    pub conn: std::sync::Arc<aci::Connection>,
    pub map: crate::server::map::Map,
    pub player: crate::server::entity::Player,
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
        let player = crate::server::entity::Player::try_from(
                            conn.get_value("gamedata", "player").await?
                        ).map_err(|e| GenericError::new(e, ErrorKind::ParsingError))?;
        
        Ok(
            GameState
            {
                conn, map, player, event_listener,
                opts: options
            }
        )
    }

    /// Update the game state
    pub async fn tick(&mut self, dt: f64) -> GenericResult<()>
    {
        self.player.tick(dt);
        if self.player.attempt_movement(&self.map, dt)
        {
            // debug!("Player encountered a collision");
        }

        if let Ok(_event) = self.event_listener.try_recv()
        {
            self.map = super::super::process::get_map(self.conn.clone(), &self.opts).await?;
        }

        Ok(())
    }

    /// Send the data back to the server
    pub async fn send_to_server(&self) -> GenericResult<()>
    {
        let json_data = serde_json::Value::try_from(&self.player).map_err(|e| GenericError::new(e, ErrorKind::ParsingError))?;
        let conn = self.conn.clone();

        tokio::spawn(async move {conn.set_value("gamedata", "player", json_data).await});

        Ok(())
    }
}