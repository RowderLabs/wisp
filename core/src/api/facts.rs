use prisma_client_rust::exec;
use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};

use crate::{
    prisma,
    seed::{AttrFact, Fact, FactGroup, TextFact},
};

use self::raw_character_fact::character_facts::Data;

use super::Ctx;

prisma::fact_group::select!(raw_fact_group {name entity facts: select {id name r#type options}});

prisma::fact::select!(raw_character_fact {name r#type options character_facts: select {value}});


#[derive(Debug, Deserialize, Serialize, specta::Type)]
#[serde(untagged)]

enum FactDTOEnum {
    Text {
        name: String,
        r#type: String,
        value: String,
    },
    Attr {
        name: String,
        r#type: String,
        value: String,
        options: Vec<String>,
    },
}

impl Into<FactDTOEnum> for raw_character_fact::Data {
    fn into(self) -> FactDTOEnum {
        match self.options.is_some() {
            false => FactDTOEnum::Text {
                name: self.name,
                r#type: self.r#type,
                value: self
                    .character_facts
                    .first()
                    .map(|entry| entry.value.to_owned())
                    .unwrap_or_else(|| String::new()),
            },
            true => FactDTOEnum::Attr {
                name: self.name,
                r#type: self.r#type,
                value: self
                    .character_facts
                    .first()
                    .map(|entry| entry.value.to_owned())
                    .unwrap_or_else(|| String::new()),
                options: serde_json::from_str(&self.options.unwrap_or_default()).unwrap_or(vec![]),
            }
        }
    }
}



#[derive(Debug, Deserialize)]
struct FactFilters {
    group: Option<String>,
}

#[derive(Debug, Deserialize, specta::Type)]
struct FactEntry {
    value: String,
    name: String,
}

#[derive(Debug, Deserialize, specta::Type)]
struct FactFormPayload {
    entity_id: String,
    fields: Vec<FactEntry>,
}
pub fn facts_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .query("list", |t| {
            t(|ctx: Ctx, _: ()| async move {
                //takes no arguments
                let groups = ctx
                    .client
                    .fact_group()
                    .find_many(vec![])
                    .select(raw_fact_group::select())
                    .exec()
                    .await?;

                Ok(groups
                    .into_iter()
                    .map(|group| Into::<FactGroup>::into(group))
                    .collect::<Vec<FactGroup>>())
            })
        })
        .query("facts_on", |t| {
            t(|ctx: Ctx, id: String| async move {
                let facts: Vec<FactDTOEnum> = ctx
                    .client
                    .fact()
                    .find_many(vec![prisma::fact::character_facts::some(vec![
                        prisma::fact_on_character::character_id::equals(id),
                    ])])
                    .select(raw_character_fact::select())
                    .exec()
                    .await
                    .unwrap()
                    .into_iter()
                    .map(|fact| fact.into())
                    .collect();

                Ok(facts)
            })
        })
        .mutation("update_many", |t| {
            t(|ctx: Ctx, payload: FactFormPayload| async move {
                let batch_update = payload.fields.into_iter().map(|entry| {
                    ctx.client.fact_on_character().create(
                        entry.value,
                        prisma::character::id::equals(payload.entity_id.clone()),
                        prisma::fact::name::equals(entry.name),
                        vec![],
                    )
                });

                ctx.client._batch(batch_update).await.unwrap();

                Ok(())
            })
        })
}

impl Into<Fact> for raw_fact_group::facts::Data {
    fn into(self) -> Fact {
        match self.r#type.as_str() {
            "text" => Fact::TextItem { name: self.name },
            "attr" => Fact::AttrItem {
                name: self.name,
                options: serde_json::from_str(&self.options.unwrap_or_default()).unwrap_or(vec![]),
            },
            _ => panic!("unknown fact type"),
        }
    }
}

impl Into<FactGroup> for raw_fact_group::Data {
    fn into(self) -> FactGroup {
        let mapped_facts: Vec<Fact> = self.facts.into_iter().map(|fact| fact.into()).collect();

        FactGroup {
            name: self.name,
            entity: self.entity,
            facts: mapped_facts,
        }
    }
}
