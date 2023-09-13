use itertools::Itertools;
use prisma_client_rust::{or, raw, PrismaValue};
use rspc::{Config, RouterBuilder};
use serde::Deserialize;
use std::{path::PathBuf, sync::Arc};
use crate::{
    prisma::{
        self,
        person::{self, WhereParam},
    },
    tree::{family_tree::tree_person, BuildableTree, Tree},
};

use self::binder::binder_router;

mod binder;

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
            PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../app/src/rspc/bindings.ts"),
        ))
        .merge("binder", binder_router())
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

                let mut children_ids: Vec<WhereParam> = people
                    .iter()
                    .flat_map(|p| p.relationships.iter().filter(|r| r.children.len() > 0))
                    .map(|r| or!(person::parent_relation_id::equals(Some(r.id))))
                    .collect_vec();

                loop {
                    if children_ids.len() == 0 {
                        break;
                    }

                    let next_gen = ctx
                        .client
                        .person()
                        .find_many(children_ids)
                        .select(tree_person::select())
                        .exec()
                        .await
                        .unwrap();

                    tree.create_level(&next_gen).unwrap();

                    children_ids = next_gen
                        .iter()
                        .flat_map(|p| p.relationships.iter().filter(|r| r.children.len() > 0))
                        .map(|r| or!(person::parent_relation_id::equals(Some(r.id))))
                        .collect_vec();
                }

                tree.into_tree_data()
            })
        })
}
