mod error;
use error::GenericResult;

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
    let (conn, listener, _) = aci::connect("127.0.0.1", 8080).await?;
    let conn = std::sync::Arc::new(conn);

    // Start the listener
    tokio::spawn(listener);

    conn.close().await?;

    Ok(())
}