use snafu::Snafu;

#[derive(Debug, Snafu)]
#[snafu(visibility(pub(crate)))] 
pub enum TreeError {
    #[snafu(display("Node does not exist"))]
    NodeNotFound,
    #[snafu(display("Failed to create link data."))]
    LinkCreationError {source: Box<dyn std::error::Error>},
    #[snafu(whatever, display("{message}"))]
    Whatever {
        message: String,
        #[snafu(source(from(Box<dyn std::error::Error>, Some)))]
        source: Option<Box<dyn std::error::Error>>,
    },
}
