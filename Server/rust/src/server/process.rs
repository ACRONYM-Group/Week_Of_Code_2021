use crate::error::GenericResult;
use crate::error::GenericError;
use crate::error::ErrorKind;

/// Execute the main portion of the game server
pub async fn execute(conn: std::sync::Arc<aci::Connection>) -> GenericResult<()>
{
    trace!("Starting server process");

    // Retrieve the password from the environment variable
    let password = std::env::var("GAME_SERVER_PASSWORD").map_err(
        |_| GenericError::new("Unable to read server password from environment variable `GAME_SERVER_PASSWORD`".to_string(),
            ErrorKind::EnvironmentError))?;
    
    // Attempt to authenticate with the server
    if !conn.a_auth("bots.woc_2021", &password).await?
    {
        return Err(GenericError::new("Unable to authenticate with the ACI server".to_string(), ErrorKind::ConnectionError));
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

    let block0 = serde_json::json!({"name":"grass", "color":"#009900", "blocks":false});
    let block1 = serde_json::json!({"name":"wall", "color":"#8f6d0e", "block":true});

    let width = 100;
    let height = 100;

    let mut data = vec![vec![block0; height]; width];

    for x in 0..width
    {
        for y in 0..height
        {
            let set = ((x as f64 - 25.0) * (x as f64 - 25.0) + (y as f64 - 25.0) * (y as f64 - 25.0)) < 25.0 * 25.0 ||
            ((x as f64 - 75.0) * (x as f64 - 75.0) + (y as f64 - 75.0) * (y as f64 - 75.0)) < 25.0 * 25.0;

            if set
            {
                data[x][y] = block1.clone();
            }
        }
    }

    debug!("Done building");

    let jsondata = serde_json::json!(data);

    debug!("Done compiling json");

    conn.set_value("gamedata", "map", jsondata).await?;

    Ok(())
}