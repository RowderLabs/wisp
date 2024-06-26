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
pub mod tag;

#[derive(Clone, Debug)]
pub struct Ctx {
    pub client: Arc<prisma::PrismaClient>,
}

pub type Router = rspc::Router<Ctx>;
#[derive(Deserialize, serde::Serialize, specta::Type)]
struct QueryReturnType {
    name: String,
}

pub fn new() -> Router {
    Router::new()
        .config(Config::new().export_ts_bindings(
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../packages/client/src/bindings.ts"),
        ))
        .merge("canvas.", canvas::canvas_router())
        .merge("panels.", panels::panels_router())
        .merge("links.", links::links_router())
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
        .middleware(|mw| {
            mw.middleware(|mw| async move {
                let state = (mw.req.clone(), mw.ctx.clone(), mw.input.clone());
                Ok(mw.with_state(state))
            })
            .resp(|state, result| async move {
                let req = state.0;

                println!("[LOG] {}: {}", req.kind.to_str(), req.path);

                Ok(result)
            })
        })
        .merge("tags.", tag::entity_tag_router())
        .merge("facts.", facts::facts_router())
        .merge("characters.", characters::characters_router())
        .merge("locations.", locations::locations_router())
        .build()
}
