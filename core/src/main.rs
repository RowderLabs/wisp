use itertools::Itertools;
use prisma_client_rust::NewClientError;
use wispcore::{prisma, TreeLink, TreeNode};

#[tokio::main]
async fn main() {
    let client: Result<prisma::PrismaClient, NewClientError> =
        prisma::PrismaClient::_builder().build().await;
    let prisma = client.unwrap();

    let m_s = prisma
        .relationship()
        .find_many(vec![])
        .exec()
        .await
        .unwrap();
    let m: Vec<TreeLink> = m_s.into_iter().map(|r| r.into()).collect_vec();

    let people = prisma.person().find_many(vec![]).exec().await.unwrap();
    let as_node: Vec<TreeNode> = people.into_iter().map(|p| p.into()).collect_vec();

    println!("{:#?}", as_node);
    println!("{:#?}", m);
}
