use serde::Deserialize;

use crate::{
    api::characters::{construct_path, generate_id},
    prisma::{self, fact},
};

pub async fn seed(prisma: &prisma::PrismaClient) {
    //reset db

    let result: AllFacts = serde_json::from_str(r#"{
  "character": {
    "groups": [
        {"name": "basic info", "entity": "character", "facts": [
      {"key": "First Name", "type": "text"},
      {"key": "Last Name", "type": "text"},
      {"key": "Occupation", "type": "attr", "options": ["Police Officer", "Dragon Slayer", "Detective"]}
      
    ]}
        ]
  }
}"#).unwrap();

    let mut facts = vec![];
    for group in result.character.groups.into_iter() {
        let new_group = prisma
            .fact_group()
            .create(group.entity.into(), group.name, vec![])
            .exec()
            .await
            .unwrap();
        for fact in group.facts {
            match fact {
                Fact::TextItem(fact) => facts.push(prisma.fact().create(
                    fact.key,
                    fact.item_type,
                    prisma::fact_group::id::equals(new_group.id),
                    vec![],
                )),
                Fact::AttrItem(fact) => facts.push(prisma.fact().create(
                    fact.key,
                    fact.item_type,
                    prisma::fact_group::id::equals(new_group.id),
                    vec![fact::options::set(Some(fact.options))],
                )),
            }
        }
    }

    prisma._batch(facts).await.unwrap();
    let characters_id = generate_id("Characters".into());
    let characters = prisma
        .character()
        .create(
            characters_id.clone(),
            construct_path(&characters_id, &None),
            "Characters".into(),
            true,
            vec![],
        )
        .exec()
        .await
        .unwrap();
}

#[derive(Debug, Deserialize)]
struct AllFacts {
    character: FactsEntry,
}

#[derive(Debug, Deserialize)]
struct FactsEntry {
    groups: Vec<FactGroup>,
}

#[derive(Debug, Deserialize)]
struct FactGroup {
    name: String,
    entity: String,
    facts: Vec<Fact>,
}



#[derive(Debug, Deserialize)]
#[serde(untagged)]
enum Fact {
    TextItem(TextFact),
    AttrItem(AttrFact),
}

#[derive(Debug, Deserialize)]
struct TextFact {
    key: String,
    #[serde(rename = "type")]
    item_type: String,
}

#[derive(Debug, Deserialize)]
struct AttrFact {
    key: String,
    #[serde(rename = "type")]
    item_type: String,
    #[serde(skip_deserializing)]
    options: String,
}
