#[allow(warnings, unused)]
mod prisma;
 
use prisma::PrismaClient;
use prisma_client_rust::NewClientError;
 
#[tokio::main]
async fn main() {
    let client: Result<PrismaClient, NewClientError> = PrismaClient::_builder().build().await;
    let result = client;
    println!("{:#?}", result.unwrap().family().find_many(vec![]).exec().await.unwrap());
}