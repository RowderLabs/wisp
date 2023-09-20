use crate::prisma::{
    self,
    binder_item::{self},
    binder_path, family, person, relationship,
};

pub async fn seed(prisma: &prisma::PrismaClient) {
    let family = prisma
        .family()
        .create("Blackwoods".into(), vec![])
        .exec()
        .await
        .unwrap();

    let lord = prisma
        .person()
        .create(
            "Lord".into(),
            vec![person::family::connect(family::id::equals(family.id))],
        )
        .exec()
        .await
        .unwrap();
    let lady = prisma
        .person()
        .create("Lady".into(), vec![])
        .exec()
        .await
        .unwrap();

    let marriage = prisma
        .relationship()
        .create(
            "marriage".into(),
            vec![relationship::members::connect(vec![
                person::id::equals(lord.id),
                person::id::equals(lady.id),
            ])],
        )
        .exec()
        .await
        .unwrap();

    let sage = prisma
        .person()
        .create(
            "Sage".into(),
            vec![
                person::child_of::connect(relationship::id::equals(marriage.id)),
                person::parents::connect(vec![
                    person::id::equals(lord.id),
                    person::id::equals(lady.id),
                ]),
            ],
        )
        .exec()
        .await
        .unwrap();

    let characters_path = prisma
        .binder_path()
        .create("/characters".into(), vec![])
        .exec()
        .await
        .unwrap();

    let lord_path = prisma
        .binder_path()
        .create(
            format!("{}/{}", characters_path.path, characters_path.id),
            vec![],
        )
        .exec()
        .await
        .unwrap();

    let lord_obj = prisma
        .binder_item()
        .create(
            lord_path.path,
            "Lord".into(),
            vec![binder_item::character::connect(person::id::equals(lord.id)), binder_item::item_type::set(Some("character".into()))],
        )
        .exec()
        .await
        .unwrap();

    let characters = prisma
        .binder_item()
        .create(
            characters_path.path.clone(),
            "Characters".into(),
            vec![binder_item::item_paths::connect(vec![
                binder_path::id::equals(lord_path.id),
            ])],
        )
        .exec()
        .await
        .unwrap();
}
