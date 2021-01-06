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
    let map_data = std::sync::Arc::new(map::Map::new());

    /*
    info!("Clearing the map on the server");
    conn.set_value("gamedata", "map", json!(vec![0u8; map::NUM_CHUNKS])).await?;

    info!("Starting Map Write");
    let (tx, mut rx) = tokio::sync::mpsc::channel::<Result<(), aci::errors::ACIError>>(map::NUM_CHUNKS);
    let tx = std::sync::Arc::new(tx);

    let reciever = tokio::spawn(async move
        {
            let mut recieved = 0;
            let mut last_percent = 0;
            while recieved < map::NUM_CHUNKS
            {
                if let Some(r) = rx.recv().await
                {
                    if r.is_err()
                    {
                        return r;
                    };

                    recieved += 1;

                    let current_percent = recieved * 100 / map::NUM_CHUNKS;
                    if (recieved + 1) * 100 / map::NUM_CHUNKS > last_percent
                    {
                        last_percent = current_percent;
                        trace!("{}% Done", last_percent);
                    }
                }
            }

            Ok(())
        }
    );

    for i in 0..map::NUM_CHUNKS
    {
        let tx = tx.clone();
        let conn = conn.clone();
        let map_data = map_data.clone();
        tokio::spawn(
            async move
            {
                tx.send(conn.set_index("gamedata", "map", i, serde_json::Value::from(&map_data.chunks[i])).await).await.unwrap();
            }
        );
    }
    info!("Done Performing Sends");

    tokio::join!(reciever).0.map_err(|_| GenericError::new("Map send handler failed".to_string(), ErrorKind::ConnectionError))??;

    info!("Done Writing Map Data!");*/

    info!("Creating JSON");
    let json_data = json!(map_data.chunks.iter().map(|c| c.to_string()).collect::<String>());

    info!("Clearing the map on the server");
    let setter = tokio::spawn(async move {conn.set_value("gamedata", "map", json_data).await});

    info!("Done Sending");

    tokio::join!(setter).0.map_err(|_| GenericError::new("Map send handler failed".to_string(), ErrorKind::ConnectionError))??;

    info!("Done Writing Map Data!");

    Ok(())
}