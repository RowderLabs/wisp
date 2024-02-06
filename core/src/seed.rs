use crate::{
    api::characters::{construct_path, generate_id},
    prisma,
};

pub async fn seed(prisma: &prisma::PrismaClient) {
    //reset db

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

    let sotiria_id = generate_id("Sotiria".into());
    let sotiria = prisma
        .character()
        .create(
            sotiria_id.clone(),
            construct_path(&sotiria_id, &Some(characters.path.as_str())),
            "Sotiria".into(),
            false,
            vec![],
        )
        .exec()
        .await
        .unwrap();

    let sage_id = generate_id("Sage".into());
    let sage = prisma
        .character()
        .create(
            sage_id.clone(),
            construct_path(&sage_id, &Some(&characters.path)),
            "Sage".into(),
            false,
            vec![],
        )
        .exec()
        .await
        .unwrap();

    let panel = prisma
        .panel()
        .create(150, 200, 150, 300, vec![])
        .exec()
        .await
        .unwrap();
}
