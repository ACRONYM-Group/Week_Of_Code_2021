use super::{CHUNK_SIZE, MAP_SIZE_CHUNKS, Chunk, MapElement};

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
        x + y * 50
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
        self.get(x as usize, y as usize).walking_speed().is_none()
    }
}
