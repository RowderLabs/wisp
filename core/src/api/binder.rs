use std::collections::HashMap;

use super::Ctx;
use super::RouterBuilder;
use crate::prisma::character_collection;
use crate::prisma::person;


pub fn binder_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().query("characters", |t| {
        t(|ctx: Ctx, path: Option<String>| async move {
            let collections = ctx
                .client
                .character_collection()
                .find_many(vec![character_collection::path::equals(path)])
                .exec()
                .await?;

            let mut mapper: HashMap<String, Vec<character_collection::Data>>  = HashMap::new();

            for c in collections.into_iter() {
                mapper.entry(c.path.clone().unwrap_or("/".to_owned())).or_default().push(c);
            }

            Ok(mapper)

        })
    })
}
