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

    Ok(())
}