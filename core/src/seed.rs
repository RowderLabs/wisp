use crate::prisma::{
    self, attribute,
    binder_item::{self},
    binder_path, family, person, relationship,
};

pub async fn seed(prisma: &prisma::PrismaClient) {
    //reset db
    prisma
        ._db_push()
        .accept_data_loss()
        .force_reset()
        .await
        .unwrap();

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
        .create(
            "/characters".into(),
            "Characters".into(),
            vec![binder_path::is_collection::set(true)],
        )
        .exec()
        .await
        .unwrap();

    let lord_path = prisma
        .binder_path()
        .create(
            format!("{}/{}", characters_path.path, characters_path.id),
            "Lord".into(),
            vec![binder_path::parent::connect(binder_path::id::equals(
                characters_path.id,
            ))],
        )
        .exec()
        .await
        .unwrap();

    let lord_obj_ref = prisma
        .binder_item()
        .create(vec![
            //connect path
            binder_item::binder_path::connect(binder_path::id::equals(lord_path.id)),
            //connect character obj
            binder_item::character::connect(person::id::equals(lord.id)),
        ])
        .exec()
        .await
        .unwrap();

    let age = prisma
        .attribute()
        .create("age".into(), "characters".into(), vec![])
        .exec()
        .await
        .unwrap();

    prisma
        .character_attribute()
        .create(
            "22".into(),
            attribute::id::equals(age.id),
            person::id::equals(lord.id),
            vec![],
        )
        .exec()
        .await
        .unwrap();
}
