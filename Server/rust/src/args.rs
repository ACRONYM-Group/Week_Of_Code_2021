use structopt::StructOpt;

#[derive(Debug, StructOpt)]
#[structopt(about = "Run the server process for the ACRONYM Week of Code 2021")]
pub struct Arguments
{
    /// Reload the map on the server (can take a significant amount of time)
    #[structopt(long, short="r")]
    pub reload_map: bool,

    /// Load the map from the server (can take a significant amount of time)
    #[structopt(long, short="l")]
    pub load_map: bool,
}