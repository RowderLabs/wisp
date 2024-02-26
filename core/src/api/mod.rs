use crate::prisma;
use rspc::{Config, RouterBuilder};
use serde::Deserialize;
use std::{path::PathBuf, sync::Arc};

pub mod canvas;
pub mod characters;
pub mod facts;
pub mod links;
pub mod locations;
pub mod panels;

pub struct Ctx {
    pub client: Arc<prisma::PrismaClient>,
}

pub type Router = rspc::Router<Ctx>;
#[derive(Deserialize, serde::Serialize, specta::Type)]
struct QueryReturnType {
    name: String,
}

pub fn new() -> RouterBuilder<Ctx> {
    Router::new()
        .config(Config::new().export_ts_bindings(
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../packages/client/src/bindings.ts"),
        ))
        .query("entity.get", |t| {
            t(|ctx: Ctx, entity_id: String| async move {
                ctx.client
                    .entity()
                    .find_unique(prisma::entity::id::equals(entity_id))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .merge("characters.", characters::characters_router())
        .merge("locations.", locations::locations_router())
        .merge("canvas.", canvas::canvas_router())
        .merge("panels.", panels::panels_router())
        .merge("facts.", facts::facts_router())
        .merge("links.", links::links_router())
}
