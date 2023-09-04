use itertools::Itertools;
use prisma_client_rust::NewClientError;
use wispcore::{
    prisma::{self, person, relationship},
    TreeData, TreeNode,
};

person::select!(person_tree {
    id name relationships: select {id members children}
});

#[tokio::main]
async fn main() {
    let client: Result<prisma::PrismaClient, NewClientError> =
        prisma::PrismaClient::_builder().build().await;
    let prisma = client.unwrap();

    let people = prisma
        .person()
        .find_many(vec![person::family_id::equals(Some(1))])
        .with(
            person::relationships::fetch(vec![])
                .with(relationship::members::fetch(vec![]))
                .with(relationship::children::fetch(vec![])),
        )
        .exec()
        .await
        .unwrap();

    let mut current = people;
    let mut result: Vec<TreeNode> = Vec::new();

    loop {
        let (nodes, next) = TreeData::build_generation(&mut current);
        result.extend(nodes);

        let next_generation = next.iter().map(|id| {
            prisma
                .person()
                .find_many(vec![person::parent_relation_id::equals(Some(*id))])
                .with(
                    person::relationships::fetch(vec![])
                        .with(relationship::members::fetch(vec![]))
                        .with(relationship::children::fetch(vec![])),
                )
        });

        if next_generation.len() == 0 {
            break;
        }

        current = prisma
            ._batch(next_generation)
            .await
            .unwrap()
            .into_iter()
            .flatten()
            .collect_vec();
    }

    println!("{:#?}", result);
}
