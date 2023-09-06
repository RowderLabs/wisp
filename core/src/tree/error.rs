use snafu::Snafu;

#[derive(Debug, Snafu)]
#[snafu(visibility(pub(crate)))] 
pub enum TreeError {
    #[snafu(display("Node does not exist"))]
    NodeNotFound
}
