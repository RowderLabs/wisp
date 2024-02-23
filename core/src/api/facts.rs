use itertools::Itertools;
use prisma_client_rust::exec;
use rspc::RouterBuilder;
use serde::{Deserialize, Serialize};

use crate::{
    prisma::{self, fact, fact_slice},
    seed::{AttrFact, Fact, FactGroup, TextFact},
};

use self::raw_character_fact::character_facts::Data;

use super::Ctx;

prisma::fact::select!(raw_character_fact {name r#type options group: select {name} character_facts: select {value}});

#[derive(Debug, Deserialize, Serialize, specta::Type)]
#[serde(rename_all = "camelCase")]
#[serde(tag = "type")]

enum FactDTOEnum {
    Text {
        name: String,
        value: String,
        group_name: String,
    },
    Attr {
        name: String,
        value: Vec<String>,
        options: Vec<String>,
        group_name: String,
    },
}

impl From<raw_character_fact::Data> for FactDTOEnum {
    fn from(data: raw_character_fact::Data) -> Self {
        match data.r#type.as_str() {
            "text" => FactDTOEnum::Text {
                name: data.name,
                value: data
                    .character_facts
                    .first()
                    .map(|entry| entry.value.to_owned())
                    .unwrap_or_else(|| String::new()),
                group_name: data.group.name,
            },
            "attr" => FactDTOEnum::Attr {
                name: data.name,
                value: data
                    .character_facts
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

#[derive(Debug, Deserialize)]
struct FactFilters {
    group: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, specta::Type)]
#[serde(untagged)]
enum FactValue {
    Text(String),
    Attr(Vec<String>),
}

#[derive(Debug, Deserialize, specta::Type)]
struct FactEntry {
    value: FactValue,
    name: String,
}

#[derive(Debug, Deserialize, specta::Type)]
struct FactFormPayload {
    entity_id: String,
    fields: Vec<FactEntry>,
}

#[derive(Debug, Deserialize, specta::Type)]
struct FactSlicePayload {
    slice_id: i32,
    entity_id: String,
}

impl Into<String> for FactValue {
    fn into(self) -> String {
        match self {
            FactValue::Text(value) => value,
            FactValue::Attr(value) => serde_json::to_string(&value).unwrap(),
        }
    }
}

pub fn facts_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .query("list", |t| {
            t(|ctx: Ctx, id: String| async move {
                //takes no arguments
                let groups: Vec<FactDTOEnum> = ctx
                    .client
                    .fact()
                    .find_many(vec![])
                    .select(raw_character_fact::select())
                    .exec()
                    .await
                    .unwrap_or_default()
                    .into_iter()
                    .map(|fact| fact.into())
                    .collect();

                Ok(groups)
            })
        })
        .query("slice", |t| {
            t(|ctx: Ctx, payload: FactSlicePayload| async move {

                #[derive(Debug, Deserialize, Serialize, specta::Type)]
                struct CharacterFactSlice {
                    name: String,
                    facts: Vec<FactDTOEnum>,
                }

                let maybe_slice = ctx
                    .client
                    .fact_slice()
                    .find_unique(prisma::fact_slice::id::equals(payload.slice_id))
                    .exec()
                    .await?;

                if let Some(slice) = maybe_slice {
                    let facts = ctx
                        .client
                        .fact()
                        .find_many(vec![fact::slices::some(vec![
                            prisma::fact_slice::id::equals(slice.id),
                        ])])
                        .select(raw_character_fact::select())
                        .exec()
                        .await
                        .unwrap()
                        .into_iter()
                        .map(|fact| fact.into())
                        .collect_vec();

                    return Ok(CharacterFactSlice {
                        name: slice.name,
                        facts,
                    });
                }

                Err(rspc::Error::new(
                    rspc::ErrorCode::NotFound,
                    format!("slice with id {} not found", payload.slice_id),
                ))
            })
        })
        .mutation("update_many", |t| {
            t(|ctx: Ctx, payload: FactFormPayload| async move {
                for entry in payload.fields {
                    ctx.client
                        .fact_on_character()
                        .upsert(
                            prisma::fact_on_character::character_id_fact_name(
                                payload.entity_id.clone(),
                                entry.name.clone(),
                            ),
                            prisma::fact_on_character::create(
                                entry.value.clone().into(),
                                prisma::character::id::equals(payload.entity_id.clone()),
                                prisma::fact::name::equals(entry.name),
                                vec![],
                            ),
                            vec![prisma::fact_on_character::value::set(entry.value.into())],
                        )
                        .exec()
                        .await?;
                }

                let updated_facts: Vec<FactDTOEnum> = ctx
                    .client
                    .fact()
                    .find_many(vec![])
                    .select(raw_character_fact::select())
                    .exec()
                    .await
                    .unwrap()
                    .into_iter()
                    .map(|fact| fact.into())
                    .collect();

                Ok(updated_facts)
            })
        })
}
