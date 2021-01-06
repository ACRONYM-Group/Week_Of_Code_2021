const CHUNK_SIZE: usize = 100;
const MAP_SIZE: usize = 5000;
const MAP_SIZE_CHUNKS: usize = MAP_SIZE / CHUNK_SIZE;

pub mod chunk;
pub use chunk::*;

pub mod element;
pub use element::*;

pub mod generation;
pub use generation::*;

pub mod map;
pub use map::*;