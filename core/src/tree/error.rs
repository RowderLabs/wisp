use snafu::Snafu;

#[derive(Debug, Snafu)]
#[snafu(visibility(pub(crate)))] 
pub enum Error {
    #[snafu(display("Node does not exist"))]
    NodeNotFound
}