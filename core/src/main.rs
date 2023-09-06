use prisma_client_rust::NewClientError;
use wispcore::{
    prisma::{self, person}, tree::family_tree::builder::FamilyTreeBuilder,
};

#[tokio::main]
async fn main() {
    let client: Result<prisma::PrismaClient, NewClientError> =
        prisma::PrismaClient::_builder().build().await;
    let prisma = client.unwrap();

    let tree = FamilyTreeBuilder::init().family(1).build(&prisma).await;
}
