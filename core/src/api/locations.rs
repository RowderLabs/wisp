use super::{characters::{construct_path, generate_id}, Ctx};
use crate::{
    entity::{create_file_tree, Entity, EntityType},
    prisma::{self, canvas, panel},
};
use rspc::RouterBuilder;
use serde::Deserialize;

#[derive(Deserialize, specta::Type)]
#[serde(rename_all = "camelCase")]
struct CreateLocation {
    name: String,
    parent: Option<String>,
    is_collection: bool,
}

pub fn locations_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .query("tree", |t| {
            t(|ctx: Ctx, _: ()| async move {
                //takes no arguments
                let characters = ctx
                    .client
                    .entity()
                    .find_many(vec![prisma::entity::r#type::equals(
                        EntityType::Location.to_string(),
                    )]) //list of filters (empty for now because not filtering)
                    .select(Entity::select())
                    .exec()
                    .await
                    .unwrap();

                create_file_tree(&characters)
            })
        })
        .mutation("create", |t| {
            t(|ctx: Ctx, location_details: CreateLocation| async move {
                let CreateLocation {
                    name,
                    //TODO: change to parentPath
                    parent,
                    is_collection,
                } = location_details;

                let id = generate_id(&name);
                let location = ctx
                    .client
                    .entity()
                    .create(
                        id.clone(),
                        name.clone(),
                        EntityType::Location.to_string(),
                        construct_path(&id, &parent.as_deref()),
                        is_collection,
                        vec![],
                    )
                    .exec()
                    .await?;

                let canvas = ctx
                    .client
                    .canvas()
                    .create(prisma::entity::id::equals(location.id.clone()), vec![])
                    .exec()
                    .await?;

                return Ok(location);
            })
        })
}
