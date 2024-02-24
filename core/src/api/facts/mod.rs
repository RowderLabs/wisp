pub mod character;
use self::character::character_facts_router;

use super::Ctx;
use crate::prisma::{self, canvas, panel};
use rspc::RouterBuilder;
use serde::Deserialize;

pub fn facts_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().merge("character.", character_facts_router())
}
