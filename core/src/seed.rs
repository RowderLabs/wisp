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
}
