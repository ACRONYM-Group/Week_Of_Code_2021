/// Bounding box for various entities, size is the width of the bounding box, the bounding box is always a square
#[derive(Debug, Clone)]
pub struct BoundingBox
{
    size: f64
}

impl BoundingBox
{
    /// Create a new bounding box with the given size
    pub fn new(size: f64) -> Self
    {
        Self
        {
            size
        }
    }

    /// Check for a collision with this bounding box at a given position
    pub fn check_collision<F>(&self, pos: cgmath::Vector2<f64>, cell_collision_check: F) -> bool where F: Fn(f64, f64) -> bool
    {
        for x in (pos.x - self.size / 2.0) as isize..=(pos.x + self.size / 2.0) as isize
        {
            for y in (pos.y - self.size / 2.0) as isize..=(pos.y + self.size / 2.0) as isize
            {
                if cell_collision_check(x as f64, y as f64)
                {
                    return true;
                }
            }   
        }

        return false;
    }
}