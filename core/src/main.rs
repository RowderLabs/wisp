use prisma_client_rust::NewClientError;
use wispcore::prisma::{self, family, person};

#[tokio::main]
async fn main() {
    let client: Result<prisma::PrismaClient, NewClientError> =
        prisma::PrismaClient::_builder().build().await;
    let prisma = client.unwrap();

}

async fn seed(prisma: &prisma::PrismaClient) {
    let family = prisma
        .family()
        .create("Blackwoods".into(), vec![])
        .exec()
        .await
        .unwrap();

    let lord = prisma
        .person()
        .create("Lord".into(), family::id::equals(family.id), vec![])
        .exec()
        .await
        .unwrap();
    let lady = prisma
        .person()
        .create("Lady".into(), family::id::equals(family.id), vec![])
        .exec()
        .await
        .unwrap();
    let _sage = prisma
        .person()
        .create(
            "Sage".into(),
            family::id::equals(1),
            vec![person::parents::connect(vec![
                person::id::equals(lord.id),
                person::id::equals(lady.id),
            ])],
        )
        .exec()
        .await
        .unwrap();
}
