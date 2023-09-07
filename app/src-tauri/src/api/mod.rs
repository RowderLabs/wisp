use std::{sync::Arc, path::PathBuf};
use rspc::{RouterBuilder, Config};
use wispcore::prisma;

pub struct Ctx {
    pub client: Arc<prisma::PrismaClient>,
}

pub type Router = rspc::Router<Ctx>;

pub fn new() -> RouterBuilder<Ctx> {
    Router::new()
        .config(Config::new().export_ts_bindings(
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../src/rspc/bindings.ts"),
        ))
        .query("version", |t| t(|_, _: ()| env!("CARGO_PKG_VERSION")))
}