use super::Ctx;
use crate::{
    entity::{create_file_tree, Entity, EntityType},
    prisma::{self},
};
use prisma_client_rust::{and, or, not};
use rspc::RouterBuilder;

pub fn tree_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .query("characters", |t| {
            t(|ctx: Ctx, _: ()| async move {
                //takes no arguments
                let characters = ctx
                    .client
                    .entity()
                    .find_many(vec![or![
                        prisma::entity::r#type::equals(EntityType::Character.to_string()),
                        and![
                            prisma::entity::r#type::equals(EntityType::Anchor.to_string()),
                            prisma::entity::name::equals("Characters".into())
                        ]
                    ]]) //list of filters (empty for now because not filtering)
                    .select(Entity::select())
                    .exec()
                    .await
                    .unwrap();

                create_file_tree(&characters)
            })
        })
        .query("worldbuilding", |t| {
            t(|ctx: Ctx, _: ()| async move {
                //takes no arguments
                let world = ctx
                    .client
                    .entity()
                    .find_many(vec![or![
                        prisma::entity::r#type::equals(EntityType::Location.to_string()),
                        and![
                            prisma::entity::r#type::equals(EntityType::Anchor.to_string()),
                            not!(prisma::entity::name::equals("Characters".into()))
                        ]
                    ]]) //list of filters (empty for now because not filtering)
                    .select(Entity::select())
                    .exec()
                    .await
                    .unwrap();

                create_file_tree(&world)
            })
        })
}
