#![allow(dead_code)]

#[macro_use]
extern crate log;

#[macro_use]
extern crate serde_json;

use structopt::StructOpt;

mod args;
mod error;
use error::GenericResult;
mod logging;
mod server;

#[tokio::main]
async fn main()
{
    if let Err(error) = run().await
    {
        error!("{}", error);
                  
        std::process::exit(1);
    }
}

async fn run() -> GenericResult<()>
{
    // Initialize the logger
    logging::initialize_logging();

    // Load options from arguments
    let opts = args::Arguments::from_args();

    // Connect to the server
    info!("Connecting to server");
    let ip = "35.225.173.218"; //"35.225.173.218";
    let (conn, listener, event_channel) = aci::connect(ip, 8766).await?;
    let conn = std::sync::Arc::new(conn);

    // Start the listener
    info!("Spawning Listener");
    tokio::spawn(listener);

    // Start the server process
    match server::execute(conn.clone(), opts, event_channel).await
    {
        // If the server process exits normally, close the connection
        Ok(()) =>
        {
            // Close the connection
            conn.close().await?;
        },
        Err(e) =>
        {
            // Attempt to close the connection, if closing the connection fails, display the nested error
            if let Err(error) = conn.close().await
            {
                error!("{}", error);
            }

            // Return the first error
            return Err(e);
        }
    }

    info!("Server process exited normally");

    // The server is done
    Ok(())
}