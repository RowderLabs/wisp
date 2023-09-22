use std::collections::HashMap;

use itertools::Itertools;

use super::Ctx;
use super::RouterBuilder;
use crate::prisma::binder_item;
use crate::prisma::binder_path;
use crate::prisma::person;
use serde::Serialize;

//partial type of binder characters query
binder_path::include!(binder_character_path {
    item: select { character }
});

pub fn binder_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("characters", |t| {
        t(|ctx: Ctx, path: Option<String>| async move {
            let mut mapper: HashMap<String, Vec<binder_character_path::Data>> = HashMap::new();

            let paths = ctx
                .client
                .binder_path()
                .find_many(vec![])
                .include(binder_character_path::include())
                .exec()
                .await?;

            paths
                .iter()
                .for_each(|p| mapper.entry(p.path.clone()).or_default().push(p.clone()));

            Ok(mapper)
        })
    })
}
