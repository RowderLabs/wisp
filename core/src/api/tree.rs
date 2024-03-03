use super::Ctx;
use crate::{
    entity::{create_file_tree, Entity, EntityType},
    prisma::{self},
};
use prisma_client_rust::or;
use rspc::RouterBuilder;

pub fn tree_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("characters", |t| {
        t(|ctx: Ctx, _: ()| async move {
            //takes no arguments
            let characters = ctx
                .client
                .entity()
                .find_many(vec![or![
                    prisma::entity::r#type::equals(EntityType::Character.to_string()),
                    prisma::entity::r#type::equals(EntityType::Anchor.to_string())
                ]]) //list of filters (empty for now because not filtering)
                .select(Entity::select())
                .exec()
                .await
                .unwrap();

            create_file_tree(&characters)
        })
    })
}
