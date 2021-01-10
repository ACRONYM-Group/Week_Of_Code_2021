use crate::error::GenericResult;
use crate::error::GenericError;
use crate::error::ErrorKind;

use super::map;
use super::state;

use std::convert::TryFrom;
use std::io::Write;

static UPDATE_RATES: f64 = 0.05;

/// Create or load the map
pub async fn get_map(conn: std::sync::Arc<aci::Connection>, options: &crate::args::Arguments) -> GenericResult<map::Map>
{
    if !options.load_map
    {
        let map_data = map::generate_test_map();

        if options.reload_map
        {
            info!("Creating JSON");
            let json_data = serde_json::Value::from(&map_data);

            info!("Clearing the map on the server");
            let setter = tokio::spawn(async move {conn.set_value("gamedata", "map", json_data).await});

            info!("Done Sending");

            tokio::join!(setter).0.map_err(|_| GenericError::new("Map send handler failed".to_string(), ErrorKind::ConnectionError))??;

            info!("Done Writing Map Data!");
        }

        Ok(map_data)
    }
    else
    {
        info!("Loading data from server");
        let data = conn.get_value("gamedata", "map").await?;

        debug!("Parsing data from server");
        super::map::Map::try_from(data)
    }
}

/// Dump the map to a file
fn dump_map(map: map::Map, path: &str) -> GenericResult<()>
{
    debug!("Dumping map to `{}`", path);

    let json_string = serde_json::Value::from(&map).to_string();

    let mut output = std::fs::File::create(path).map_err(|e| GenericError::new(format!("Unable to open file `{}` {}", path, e), ErrorKind::EnvironmentError))?;
    write!(output, "{}", json_string).map_err(|e| GenericError::new(format!("Unable to write to file `{}` {}", path, e), ErrorKind::EnvironmentError))?;

    debug!("Done dumping map");

    Ok(())
}

/// Execute the main portion of the game server
pub async fn execute(conn: std::sync::Arc<aci::Connection>, options: crate::args::Arguments, event_listener: tokio::sync::mpsc::Receiver<aci::event::ACIEvent>) -> GenericResult<()>
{
    trace!("Starting server process");

    // Retrieve the password from the environment variable
    let password = std::env::var("GAME_SERVER_PASSWORD").map_err(
        |_| GenericError::new("Unable to read server password from environment variable `GAME_SERVER_PASSWORD`".to_string(),
            ErrorKind::EnvironmentError))?;

    debug!("Using password `{}`", password);
    
    // Attempt to authenticate with the server
    if !conn.a_auth("bots.woc_2021", &password).await? // bots.woc_2021
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

    // Load the map, either from the server, or generating the map here
    let map = get_map(conn.clone(), &options).await?;

    // Dump the updated map to a file
    // dump_map(map, "map.json")?;

    let mut game_state = state::GameState::new(conn, map, event_listener, options).await?;

    let mut now = std::time::SystemTime::now();
    let mut time_ellapsed = 0.0;

    loop
    {
        // Get the delta time since the last tick
        let dt = now.elapsed().map_err(|e| GenericError::new(format!("Unable to calulate dt: {}", e), ErrorKind::EnvironmentError))?.as_millis() as f64 / 1000.0;
        now = std::time::SystemTime::now();

        time_ellapsed += dt;

        // If this tick has taken too long, add a warning
        if dt > 0.25
        {
            warn!("A tick took {} milliseconds", dt * 1000.0);
        }

        // Make sure the loop isn't endlessly spinning
        let timer = tokio::spawn(tokio::time::sleep(tokio::time::Duration::from_millis(1)));

        // Update the game state
        game_state.tick(dt).await?;

        // If the right amount of time has ellapsed, send the processed data to the server
        if time_ellapsed > UPDATE_RATES
        {
            time_ellapsed -= UPDATE_RATES;

            game_state.send_to_server().await?;
        }

        // Wait for the timer to ellapse before moving onto the next tick
        tokio::join!(timer);
    }

    // Ok(())
}