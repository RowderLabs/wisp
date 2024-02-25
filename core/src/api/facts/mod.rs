use self::character::character_facts_router;
use super::Ctx;
use crate::fact::Fact;
use crate::prisma::{self, canvas, panel};
use rspc::RouterBuilder;
use serde::Deserialize;

pub mod character;

prisma::fact_on_entity::select!((filters: Vec<prisma::fact_on_entity::WhereParam>) => DbFactValue {value });


//selects all facts for an entity with 
prisma::fact::select!(
    (entity_id: String) => FactWithValues {
        name r#type options group: select {
            name
        } 
        entity_facts(
            vec![prisma::fact_on_entity::entity_id::equals(entity_id)]
        ): select {
            value
        }
    }
);


impl From<FactWithValues::Data> for Fact {
    fn from(data: FactWithValues::Data) -> Self {
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
