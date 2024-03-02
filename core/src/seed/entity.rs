use serde::Deserialize;

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
