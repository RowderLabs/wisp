use rspc::{Config, RouterBuilder};
use std::{path::PathBuf, sync::Arc};
use wispcore::{
    prisma::{self, person},
    tree::{
        family_tree::tree_person,
        Tree,
        BuildableTree
    },
};

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
        .query("display_tree", |t| {
            t(|ctx: Ctx, family_id: i32| async move {
                let mut tree = Tree::new();
                let people = ctx
                    .client
                    .person()
                    .find_many(vec![
                        person::parent_relation_id::equals(None),
                        person::family_id::equals(Some(family_id)),
                    ])
                    .select(tree_person::select())
                    .exec()
                    .await
                    .unwrap();

                tree.create_level(&people).unwrap();
                tree.into_tree_data()
            })
        })
}
