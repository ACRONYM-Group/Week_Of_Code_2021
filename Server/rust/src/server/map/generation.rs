use super::{Map, MapElement};

/// Generate the test map
pub fn generate_test_map() -> Map
{
    info!("Generating Test Map");
    let mut map = Map::new();

    for x in 20..=22
    {
        for y in 0..=50
        {
            *map.get_mut(x, y) = MapElement::Wall;
        }
    }

    debug!("Done Generating Test Map");

    map
}