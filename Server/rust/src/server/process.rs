use crate::error::GenericResult;
use crate::error::GenericError;
use crate::error::ErrorKind;

use super::map;

/// Execute the main portion of the game server
pub async fn execute(conn: std::sync::Arc<aci::Connection>) -> GenericResult<()>
{
    trace!("Starting server process");

    // Retrieve the password from the environment variable
    let password = std::env::var("GAME_SERVER_PASSWORD").map_err(
        |_| GenericError::new("Unable to read server password from environment variable `GAME_SERVER_PASSWORD`".to_string(),
            ErrorKind::EnvironmentError))?;

    debug!("Using password `{}`", password);
    
    // Attempt to authenticate with the server
    if !conn.a_auth("bots.woc_2021", &password).await? //
    {
        return Err(GenericError::new("Authentication with ACI server failed".to_string(), ErrorKind::ConnectionError));
    }
    else
    {
        trace!("Authentication Successful");
    }
    
    // If the gamedata database has not been loaded, load it from disk
    if !conn.list_databases().await?.contains(&"gamedata".to_string())
    {
        debug!("Database `gamedata` is not loaded; loading");

        conn.read_from_disk("gamedata").await?;
    }

    info!("Creating Map");
    let mut map_data = map::Map::new();

    for x in 500..=1000
    {
        for y in 500..=1000
        {
            *map_data.get_mut(x, y) = map::MapElement::Wall;
        }
    }

    info!("Creating JSON");
    let json_data = json!(map_data.chunks.iter().map(|c| c.to_string()).collect::<String>());

    info!("Clearing the map on the server");
    let setter = tokio::spawn(async move {conn.set_value("gamedata", "map", json_data).await});

    info!("Done Sending");

    tokio::join!(setter).0.map_err(|_| GenericError::new("Map send handler failed".to_string(), ErrorKind::ConnectionError))??;

    info!("Done Writing Map Data!");

    Ok(())
}