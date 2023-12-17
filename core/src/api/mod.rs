use crate::prisma;
use itertools::Itertools;
use prisma_client_rust::{or, raw, PrismaValue};
use rspc::{Config, RouterBuilder};
use serde::Deserialize;
use std::{path::PathBuf, sync::Arc};

pub mod characters;

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
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../apps/app/src/rspc/bindings.ts"),
        ))
        .merge("characters.", characters::characters_router())
}
