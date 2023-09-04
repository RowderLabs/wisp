use prisma_client_rust::NewClientError;
use wispcore::prisma::{self, person};

#[tokio::main]
async fn main() {
    let client: Result<prisma::PrismaClient, NewClientError> =
        prisma::PrismaClient::_builder().build().await;
    let prisma = client.unwrap();

    let people = prisma
        .person()
        .find_many(vec![])
        .with(person::children::fetch(vec![]))
        .exec()
        .await.unwrap();

    print!("{:#?}", people);
}
