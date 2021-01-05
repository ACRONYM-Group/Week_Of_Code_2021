use env_logger::Env;

/// Initialize the logging environment
pub fn initialize_logging()
{
    // Set the default level
    let level = 
        // Specific to debug / release builds
        if cfg!(debug_assertions) {"trace".to_string()} else {"warn".to_string()} +
        // Generic to all builds
        ",tungstenite=error,tokio_tungstenite=error,mio::poll=error";

    // Initialize the environment
    let env = Env::default().filter_or("SERVER_LOGGING", level);

    // Initialize env_logger
    env_logger::init_from_env(env);

    info!("Logging Initialized");
}