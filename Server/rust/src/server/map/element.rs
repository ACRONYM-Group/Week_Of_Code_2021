/// Map Data
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MapElement
{
    Grass,
    Wall,
    Stone,
    Earth,
    Sand,
    RobotBase,
    AlienBase
}

impl std::fmt::Display for MapElement
{
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error>
    {
        write!(f, "{}", match self
        {
            MapElement::Grass => "g",
            MapElement::Stone => "s",
            MapElement::Wall => "w",
            MapElement::Earth => "e",
            MapElement::Sand => "S",
            MapElement::RobotBase => "r",
            MapElement::AlienBase => "a"
        })?;

        Ok(())
    }
}

impl std::str::FromStr for MapElement
{
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err>
    {
        match s
        {
            "g" => Ok(MapElement::Grass),
            "s" => Ok(MapElement::Stone),
            "w" => Ok(MapElement::Wall),
            "e" => Ok(MapElement::Earth),
            "S" => Ok(MapElement::Sand),
            "r" => Ok(MapElement::RobotBase),
            "a" => Ok(MapElement::AlienBase),
            default => Err(format!("Unknown symbol `{}`", default))
        }
    }
}

// Default map element
impl std::default::Default for MapElement
{
    fn default() -> Self
    {
        Self::Grass
    }
}

impl MapElement
{
    /// Get the walking speed on the map element, the return value will be Some(f64) when the element is passable, and
    /// None when the element is non-passable
    pub fn walking_speed(&self) -> Option<f64>
    {
        match self
        {
            MapElement::Grass => Some(1.0),
            MapElement::Stone => Some(1.2),
            MapElement::Wall => None,
            MapElement::Earth => Some(0.8),
            MapElement::Sand => Some(0.6),
            MapElement::RobotBase => Some(1.2),
            MapElement::AlienBase => Some(0.8)
        }
    }
}