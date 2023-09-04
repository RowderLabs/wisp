use prisma_client_rust::NewClientError;
use wispcore::{
    prisma::{self, person},
    tree::TreeBuilder,
};

person::select!(person_tree {
    id name relationships: select {id members children}
});

#[tokio::main]
async fn main() {
    let client: Result<prisma::PrismaClient, NewClientError> =
        prisma::PrismaClient::_builder().build().await;
    let prisma = client.unwrap();

    let tree = TreeBuilder::init().build(&prisma).await;
    println!("{:#?}", tree);
}
