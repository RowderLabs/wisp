use prisma_client_rust::NewClientError;
use wispcore::prisma::{self, person};

#[tokio::main]
async fn main() {
    let client: Result<prisma::PrismaClient, NewClientError> =
        prisma::PrismaClient::_builder().build().await;
    let prisma = client.unwrap();

    let lord = prisma
        .person()
        .find_first(vec![person::id::equals(2)])
        .with(person::children::fetch(vec![]))
        .exec()
        .await
        .unwrap()
        .unwrap();

    println!("{:#?}", lord.children);
}
