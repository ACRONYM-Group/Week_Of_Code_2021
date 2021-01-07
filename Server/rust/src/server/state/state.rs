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
    pub player: crate::server::entity::Player
}

impl GameState
{
    /// Create a new game state object from a connection and a map
    pub async fn new(conn: std::sync::Arc<aci::Connection>, map: crate::server::map::Map) -> GenericResult<Self>
    {
        // Read the position of the player from the server
        debug!("Loading player data from the server");
        let player = crate::server::entity::Player::try_from(
                            conn.get_value("gamedata", "player").await?
                        ).map_err(|e| GenericError::new(e, ErrorKind::ParsingError))?;
        
        Ok(
            GameState
            {
                conn, map, player
            }
        )
    }

    /// Update the game state
    pub async fn tick(&mut self, dt: f64) -> GenericResult<()>
    {
        self.player.tick(dt);
        if self.player.attempt_movement(&self.map, dt)
        {
            debug!("Player encountered a collision");
        }

        let c = self.conn.clone();
        let json_data = serde_json::Value::try_from(&self.player).map_err(|e| GenericError::new(e, ErrorKind::ParsingError))?;
        tokio::spawn(
            async move
            {
                c.set_value("gamedata", "player", json_data).await
            }
        );

        Ok(())
    }
}