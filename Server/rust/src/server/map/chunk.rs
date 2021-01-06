use super::{CHUNK_SIZE, MapElement};

/// Map Chunk
#[derive(Debug, Clone)]
pub struct Chunk
{
    data: Vec<MapElement>
}

impl Chunk
{
    /// Create a new, empty chunk
    pub fn new() -> Self
    {
        Self
        {
            data: vec![MapElement::default(); CHUNK_SIZE * CHUNK_SIZE]
        }
    }

    /// Get the index of a given position
    pub fn get_index(x: usize, y: usize) -> usize
    {
        x + y * 100
    }

    /// Get a value at a particular position
    pub fn get(&self, x: usize, y: usize) -> &MapElement
    {
        &self.data[Self::get_index(x, y)]
    }

    /// Get a mutable reference value at a particular position
    pub fn get_mut(&mut self, x: usize, y: usize) -> &mut MapElement
    {
        &mut self.data[Self::get_index(x, y)]
    }
}

// Render the Chunk into a string
impl std::fmt::Display for Chunk
{
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error>
    {
        for v in self.data.iter()
        {
            write!(f, "{}", v.to_string())?;
        }

        Ok(())
    }
}

impl std::str::FromStr for Chunk
{
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err>
    {
        if s.len() != CHUNK_SIZE * CHUNK_SIZE
        {
            return Err(format!("Size `{}` is not the required chunk size {}", s.len(), CHUNK_SIZE * CHUNK_SIZE));
        }

        let mut data = Vec::new();
        for c in s.as_bytes()
        {
            data.push(str::parse::<MapElement>(
                std::str::from_utf8(&[*c]).map_err(|e| format!("Cannot convert to utf8 `{}`", e))?
            )?);
        }

        Ok(Self{data})
    }
}

impl std::convert::From<&Chunk> for serde_json::Value
{
    fn from(chunk: &Chunk) -> Self
    {
        serde_json::json!(chunk.to_string())
    } 
}

impl std::default::Default for Chunk
{
    fn default() -> Self
    {
        Self::new()
    }
}