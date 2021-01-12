use core::f64;

use crate::error::{GenericError, GenericResult, ErrorKind};
use super::{CHUNK_SIZE, MAP_SIZE_CHUNKS, MAP_SIZE, Chunk, MapElement};

/// The global map
pub struct Map
{
    pub chunks: Vec<Chunk>
}

impl Map
{
    /// Create a new, empty map
    pub fn new() -> Self
    {
        Self
        {
            chunks: vec![Chunk::default(); MAP_SIZE_CHUNKS * MAP_SIZE_CHUNKS]
        }
    }

    /// Generate a new map from a set of chunks
    pub fn from_chunks(chunks: Vec<Chunk>) -> Self
    {
        Self
        {
            chunks
        }
    }

    /// Get the index of a given chunk
    pub fn get_chunk_index(x: usize, y: usize) -> usize
    {
        x + y * MAP_SIZE_CHUNKS
    }

    /// Get the chunk at a given index
    pub fn get_chunk(&self, x: usize, y: usize) -> &Chunk
    {
        &self.chunks[Self::get_chunk_index(x, y)]
    }

    /// Get a mutable reference to the chunk at a given index
    pub fn get_mut_chunk(&mut self, x: usize, y: usize) -> &mut Chunk
    {
        &mut self.chunks[Self::get_chunk_index(x, y)]
    }

    /// Get the index of a given position
    pub fn get_index(x: usize, y: usize) -> (usize, (usize, usize))
    {
        (Self::get_chunk_index(x / CHUNK_SIZE, y / CHUNK_SIZE), (x % CHUNK_SIZE, y % CHUNK_SIZE))
    }

    /// Get a value at a particular position
    pub fn get(&self, x: usize, y: usize) -> &MapElement
    {
        let (ci, (x, y)) = Self::get_index(x, y); 
        self.chunks[ci].get(x, y)
    }

    /// Get a mutable reference value at a particular position
    pub fn get_mut(&mut self, x: usize, y: usize) -> &mut MapElement
    {
        let (ci, (x, y)) = Self::get_index(x, y); 
        self.chunks[ci].get_mut(x, y)
    }

    /// Check if there is a collision at a given x and y
    pub fn check_collision(&self, x: f64, y: f64) -> bool
    {
        x < 0.0 || y < 0.0 || x > (MAP_SIZE - 1) as f64 || y > (MAP_SIZE - 1) as f64 || self.get(x as usize, y as usize).walking_speed().is_none()
    }
}

impl std::convert::From<&Map> for serde_json::Value
{
    fn from(map: &Map) -> Self
    {
        json!(map.chunks.iter().map(|c| c.to_string()).collect::<Vec<String>>())
    }
}

impl std::convert::TryFrom<serde_json::Value> for Map
{
    type Error = GenericError;

    fn try_from(data: serde_json::Value) -> GenericResult<Map>
    {
        if let serde_json::Value::Array(data) = data
        {
            let mut chunks = Vec::new();

            for val in data
            {
                if let serde_json::Value::String(s) = val
                {
                    chunks.push(str::parse::<Chunk>(&s).map_err(|e| GenericError::new(e, ErrorKind::ParsingError))?)
                }
                else
                {
                    return Err(GenericError::new(format!("Mapdata entry is not a string"), ErrorKind::ParsingError));
                }
            }

            Ok(Map::from_chunks(chunks))
        }
        else
        {
            return Err(GenericError::new(format!("Mapdata is not an array"), ErrorKind::ParsingError));
        }
    }
}