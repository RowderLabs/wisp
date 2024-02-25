
use self::character::character_facts_router;
use crate::fact::Fact;
use super::Ctx;
use crate::prisma::{self, canvas, panel};
use rspc::RouterBuilder;
use serde::Deserialize;

pub mod character;

prisma::fact::select!(DbFact {name r#type options group: select {name} entity_facts: select {value}});

impl From<DbFact::Data> for Fact {
    fn from(data: DbFact::Data) -> Self {
        match data.r#type.as_str() {
            "text" => Fact::Text {
                name: data.name,
                value: data
                    .entity_facts
                    .first()
                    .map(|entry| entry.value.to_owned())
                    .unwrap_or_else(|| String::new()),
                group_name: data.group.name,
            },
            "attr" => Fact::Attr {
                name: data.name,
                value: data
                    .entity_facts
                    .first()
                    .map(|entry| {
                        serde_json::from_str(&data.options.clone().unwrap_or_default())
                            .unwrap_or(vec![])
                    })
                    .unwrap_or_default(),
                options: serde_json::from_str(&data.options.unwrap_or_default()).unwrap_or(vec![]),
                group_name: data.group.name,
            },
            _ => panic!("Unknown fact!"),
        }
    }
}

pub fn facts_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new().merge("character.", character_facts_router())
}
