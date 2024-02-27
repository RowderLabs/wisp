use std::{
    collections::{HashMap, HashSet},
    io::Read,
    path::Path,
};

use async_trait::async_trait;
use itertools::Itertools;
use petgraph::{
    data::Build,
    graph::{self, Node, NodeIndex},
    visit::{IntoEdgesDirected, NodeRef},
};
use serde::{Deserialize, Serialize};

use crate::{
    entity::{entity_gen, Entity, EntityType},
    prisma::{self, fact, fact_slice, PrismaClient},
};

pub async fn seed(prisma: &prisma::PrismaClient, seed_path: &Path) {
    //reset db

    let mut file =
        std::fs::File::open(seed_path.join("fact_seed.json")).expect("Unable to open file");

    let mut entity_yaml =
        std::fs::File::open(seed_path.join("entities.yaml")).expect("Could not find entities yaml");
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .expect("failed to read seed file");

    let mut entities_content = String::new();
    entity_yaml
        .read_to_string(&mut entities_content)
        .expect("Could not read entities");

    EntityGenerator::default()
        .generate(&entities_content, prisma)
        .await
        .unwrap();

    let result: AllFacts = serde_json::from_str(&contents).unwrap();
    let mut facts = vec![];
    for group in result.character.groups.into_iter() {
        let new_group = prisma
            .fact_group()
            .create(group.entity, group.name, vec![])
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
                            serde_json::to_string(&options).unwrap(),
                        ))],
                    ));
                }
            }
        }
    }

    for group in result.location.groups.into_iter() {
        let new_group = prisma
            .fact_group()
            .create(group.entity, group.name, vec![])
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
                            serde_json::to_string(&options).unwrap(),
                        ))],
                    ));
                }
            }
        }
    }

    prisma._batch(facts).await.unwrap();
    let basic_info_slice = prisma
        .fact_slice()
        .create(
            "summary".into(),
            vec![fact_slice::facts::connect(vec![
                fact::name::equals("first name".into()),
                fact::name::equals("last name".into()),
                fact::name::equals("age".into()),
                fact::name::equals("birthdate".into()),
                fact::name::equals("birthplace".into()),
            ])],
        )
        .exec()
        .await;

    println!("{:#?}", basic_info_slice);

    /*let characters_id = entity_gen::generate_id("Characters");
    let _characters = prisma
        .entity()
        .create(
            characters_id.clone(),
            "Characters".into(),
            EntityType::Character.to_string(),
            entity_gen::construct_path(&characters_id, &None),
            true,
            vec![],
        )
        .exec()
        .await
        .unwrap();*/

    let locations_id = entity_gen::generate_id("locations");
    let _locations = prisma
        .entity()
        .create(
            locations_id.clone(),
            "Locations".into(),
            EntityType::Location.to_string(),
            entity_gen::construct_path(&locations_id, &None),
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
    location: FactsEntry,
}

#[derive(Debug, Deserialize)]
struct FactsEntry {
    groups: Vec<FactGroup>,
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
struct FactGroup {
    pub name: String,
    pub entity: String,
    pub facts: Vec<Fact>,
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
#[serde(tag = "type")]
enum Fact {
    #[serde(rename = "text")]
    TextItem { name: String },
    #[serde(rename = "attr")]
    AttrItem { name: String, options: Vec<String> },
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
struct TextFact {
    #[serde(rename = "factKey")]
    pub name: String,
    #[serde(rename = "type")]
    pub item_type: String,
}

#[derive(Debug, Serialize, Deserialize, specta::Type)]
struct AttrFact {
    #[serde(rename = "factKey")]
    pub name: String,
    #[serde(rename = "type")]
    pub item_type: String,
    pub options: Vec<String>,
}

#[allow(unused)]
#[derive(Deserialize, Debug, Clone)]
struct EntityGeneratorEntry {
    key: Option<String>,
    name: String,
    parent: Option<String>,
    is_collection: bool,
}

#[allow(unused)]
#[derive(Deserialize, Debug)]
struct EntityGeneratorFile {
    characters: Vec<EntityGeneratorEntry>,
}
#[derive(Default)]
pub struct EntityGenerator {}

impl EntityGenerator {
    pub async fn generate(
        &self,
        input: &str,
        client: &PrismaClient,
    ) -> Result<(), Box<dyn std::error::Error>> {
        let parsed_input: EntityGeneratorFile = serde_yaml::from_str(input)?;
        let mut lookup: HashMap<String, NodeIndex> = HashMap::new();
        let mut graph: petgraph::graph::Graph<EntityGeneratorEntry, ()> =
            petgraph::graph::Graph::new();

        for character in parsed_input.characters.iter() {
            let node_key = character
                .key
                .as_deref()
                .unwrap_or(&character.name)
                .to_string();

            //add node
            lookup
                .entry(node_key.clone())
                .or_insert_with(|| graph.add_node(character.clone()));

            if character.parent.is_none() {
                continue;
            }

            let parent_key = character.parent.as_deref().unwrap().to_string();

            let maybe_parent = parsed_input
                .characters
                .iter()
                .find(|c| c.key.as_deref().unwrap_or(&c.name) == parent_key);

            //add parent if exists
            if let Some(parent) = maybe_parent {
                lookup
                    .entry(parent_key.to_string())
                    .or_insert_with(|| graph.add_node(parent.clone()));

                graph.add_edge(
                    lookup.get(&parent_key).unwrap().to_owned(),
                    lookup.get(&node_key).unwrap().to_owned(),
                    (),
                );
            }
        }

        let sorted = petgraph::algo::toposort(&graph, None).unwrap();
        let mut key_map: HashMap<String, String> = HashMap::new();
        let mut queries = vec![];

        for node in sorted {
            let entity_entry = graph.node_weight(node).unwrap();
            entity_entry
                .key
                .as_deref()
                .unwrap_or(&entity_entry.name)
                .to_string();
            let id = entity_gen::generate_id(&entity_entry.name);
            let parent_path = key_map
                .get(entity_entry.parent.as_deref().unwrap_or_default())
                .map(|s| s.as_str());
            let path = entity_gen::construct_path(&id, &parent_path);

            println!("creating {} with id {}", entity_entry.name, id);

            let create_query = client.entity().create(
                id,
                entity_entry.name.clone(),
                EntityType::Character.to_string(),
                path.clone(),
                entity_entry.is_collection,
                vec![],
            );

            queries.push(create_query);

            if let Some(some_path) = parent_path {
                println!(
                    "found path to parent: {} when creating {}",
                    some_path, entity_entry.name
                );
            }

            key_map
                .entry(
                    entity_entry
                        .key
                        .as_deref()
                        .unwrap_or(&entity_entry.name)
                        .to_string(),
                )
                .or_insert(path);
        }

        client._batch(queries).await.unwrap();
        Ok(())
    }
}
