const CHUNK_SIZE: usize = 100;
const MAP_SIZE: usize = 5000;
const MAP_SIZE_CHUNKS: usize = MAP_SIZE / CHUNK_SIZE;

/// Map Data
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum MapElement
{
    Grass,
    Wall,
    Stone
}

impl std::fmt::Display for MapElement
{
    fn fmt(&self, f: &mut std::fmt::Formatter) -> Result<(), std::fmt::Error>
    {
        write!(f, "{}", match self
        {
            MapElement::Grass => "g",
            MapElement::Stone => "s",
            MapElement::Wall => "w"
        })?;

        Ok(())
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

/// Map Chunk
#[derive(Debug, Clone, Copy)]
pub struct Chunk
{
    data: [MapElement; CHUNK_SIZE * CHUNK_SIZE]
}

impl Chunk
{
    /// Create a new, empty chunk
    pub fn new() -> Self
    {
        Self
        {
            data: [MapElement::default(); CHUNK_SIZE * CHUNK_SIZE]
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
        for v in &self.data
        {
            write!(f, "{}", v.to_string())?;
        }

        Ok(())
    }
}

impl std::default::Default for Chunk
{
    fn default() -> Self
    {
        Self::new()
    }
}

/// The global map
pub struct Map
{
    chunks: [Chunk; MAP_SIZE_CHUNKS * MAP_SIZE_CHUNKS]
}

impl Map
{
    /// Create a new, empty chunk
    pub fn new() -> Self
    {
        Self
        {
            chunks: [Chunk::default(); MAP_SIZE_CHUNKS * MAP_SIZE_CHUNKS]
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
}

impl std::convert::From<Map> for serde_json::Value
{
    fn from(map: Map) -> Self
    {
        serde_json::json!(map.chunks.iter().map(|c| c.to_string()))
    }
}