use serde::{Deserialize, Serialize};

use crate::{
    api::characters::{construct_path, generate_id},
    prisma::{self, fact, fact_slice},
};

pub async fn seed(prisma: &prisma::PrismaClient) {
    //reset db

    let result: AllFacts = serde_json::from_str(r#"{
  "character": {
    "groups": [
        {"name": "basic info", "entity": "character", "facts": [
      {"name": "First Name", "type": "text"},
      {"name": "Last Name", "type": "text"},
      {"name": "Occupation", "type": "attr", "options": ["Police Officer", "Dragon Slayer", "Detective"]}
      
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
                Fact::TextItem { name } => {
                    facts.push(prisma.fact().create(
                        name,
                        "text".into(),
                        prisma::fact_group::id::equals(new_group.id),
                        vec![],
                    ));
                }
                Fact::AttrItem { name, options } => {
                    facts.push(prisma.fact().create(
                        name,
                        "attr".into(),
                        prisma::fact_group::id::equals(new_group.id),
                        vec![prisma::fact::options::set(Some(
                            (serde_json::to_string(&options).unwrap()),
                        ))],
                    ));
                }
            }
        }
    }

    prisma._batch(facts).await.unwrap();
    let basic_info_slice = prisma.fact_slice().create("summary".into(), vec![fact_slice::facts::connect(vec![
        fact::name::equals("First Name".into()),
        fact::name::equals("Last Name".into())
    ])]).exec().await;


    println!("{:#?}", basic_info_slice);

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


#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct FactGroup {
    pub name: String,
    pub entity: String,
    pub facts: Vec<Fact>,
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
#[serde(tag = "type")]
pub enum Fact {
    #[serde(rename = "text")]
    TextItem { name: String },
    #[serde(rename = "attr")]
    AttrItem { name: String, options: Vec<String> },
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct TextFact {
    #[serde(rename = "factKey")]
    pub name: String,
    #[serde(rename = "type")]
    pub item_type: String,
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
pub struct AttrFact {
    #[serde(rename = "factKey")]
    pub name: String,
    #[serde(rename = "type")]
    pub item_type: String,
    pub options: Vec<String>,
}
