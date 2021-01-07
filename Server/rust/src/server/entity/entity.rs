use serde::{Deserialize, Serialize};

use cgmath::InnerSpace;

/// Generic entity trait for game entities
pub trait Entity: std::convert::TryFrom<serde_json::Value> + std::convert::TryInto<serde_json::Value>
{
    /// Perform a game tick on the entity
    fn tick(&mut self, dt: f64);

    /// Attempt to perform the movement (check for collisions)
    fn attempt_movement(&mut self, map: &crate::server::map::Map, dt: f64) -> bool;
}

/// Server representation of the player
#[derive(Deserialize, Serialize)]
struct ServerRepresentationPlayer
{
    pos: Vec<f64>,
    vel: Vec<f64>,
    dir: f64
}

/// Game Player
pub struct Player
{
    bounding_box: super::BoundingBox,

    pub position: cgmath::Vector2<f64>,
    direction: f64,

    velocity: cgmath::Vector2<f64>
}

impl std::convert::TryFrom<serde_json::Value> for Player
{
    type Error = String;

    // {"pos": [0, 0], "dir": 3.1415926535, "vel": [1, 0]}
    fn try_from(value: serde_json::Value) -> Result<Player, String>
    {
        let v: ServerRepresentationPlayer = serde_json::from_value(value).map_err(
            |e| format!("Unable to parse player from json `{}`", e)
        )?;

        if v.pos.len() < 2
        {
            return Err(format!("Position read from json does not have both an x and y value"));
        }

        if v.vel.len() < 2
        {
            return Err(format!("Velocity read from json does not have both an x and y value"));
        }

        let bounding_box = super::BoundingBox::new(4.0);
        let position = cgmath::Vector2::<f64>::new(v.pos[0], v.pos[1]);
        let velocity = cgmath::Vector2::<f64>::new(v.vel[0], v.vel[1]);
        let direction = v.dir;

        Ok(
            Player
            {
                bounding_box,
                position,
                velocity,
                direction
            }
        )
    }
}

impl std::convert::TryFrom<&Player> for serde_json::Value
{
    type Error = String;

    fn try_from(player: &Player) -> Result<serde_json::Value, String>
    {
        let server_representation = ServerRepresentationPlayer
        {
            dir: player.direction,
            pos: vec![player.position.x, player.position.y],
            vel: vec![player.velocity.x, player.velocity.y]
        };

        serde_json::to_value(&server_representation).map_err(|e| format!("Unable to convert server representation to json: {}", e))
    }
}

impl std::convert::TryFrom<Player> for serde_json::Value
{
    type Error = String;

    fn try_from(player: Player) -> Result<serde_json::Value, String>
    {
        serde_json::Value::try_from(&player)
    }
}

impl Entity for Player
{
    /// Perform a game tick on the entity
    fn tick(&mut self, _dt: f64)
    {
        debug!("Tick the player");
    }

    /// Attempt to perform the movement (check for collisions)
    fn attempt_movement(&mut self, map: &crate::server::map::Map, dt: f64) -> bool
    {
        let movement_portions = vec![self.velocity.dot(cgmath::Vector2::unit_x()) * cgmath::Vector2::unit_x() * dt,
                                     self.velocity.dot(cgmath::Vector2::unit_y()) * cgmath::Vector2::unit_y() * dt];

        let mut current_pos = self.position;
        let mut has_collided = false;

        for mov in &movement_portions
        {
            let test_pos = current_pos + mov;

            if self.bounding_box.check_collision(test_pos, |x, y| map.check_collision(x, y))
            {
                has_collided = true;
            }
            else
            {
                current_pos = test_pos;
            }
        }

        self.position = current_pos;

        has_collided
    }
}