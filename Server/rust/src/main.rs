mod error;
use error::GenericResult;

mod server;

#[tokio::main]
async fn main()
{
    if let Err(error) = run().await
    {
        eprintln!("{}", error);
                  
        std::process::exit(1);
    }
}

async fn run() -> GenericResult<()>
{
    // Connect to the server
    let (conn, listener, _) = aci::connect("35.225.173.218", 8766).await?;
    let conn = std::sync::Arc::new(conn);

    // Start the listener
    tokio::spawn(listener);

    // Start the server process
    match server::execute(conn.clone()).await
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
                eprintln!("Encountered");
                eprintln!("{}", error);
                eprintln!("while handling");
            }

            // Return the first error
            return Err(e);
        }
    }

    println!("Server process exited normally");

    // The server is done
    Ok(())
}