use super::Ctx;
use crate::prisma::{canvas, panel};
use rspc::RouterBuilder;
use serde::Deserialize;

panel::partial_unchecked!(TransformUpdate {
    x
    y
    width
    height
});

#[derive(Deserialize, specta::Type)]
struct PanelTransformUpdatePayload {
    id: String,
    #[serde(flatten)]
    transform: TransformUpdate,
}

#[derive(Deserialize, specta::Type)]
struct CreatePanel {
    panel_type: String,
    x: i32,
    y: i32,
    width: i32,
    height: i32,
    content: Option<String>,
    canvas_id: String,
}

#[derive(Deserialize, specta::Type)]
struct PanelContentUpdatePayload {
    id: String,
    content: Option<String>,
}

pub fn panels_router() -> RouterBuilder<Ctx> {
    RouterBuilder::new()
        .mutation("create", |t| {
            t(|ctx: Ctx, panel: CreatePanel| async move {
                ctx.client
                    .panel()
                    .create(
                        panel.panel_type,
                        panel.x,
                        panel.y,
                        panel.width,
                        panel.height,
                        canvas::id::equals(panel.canvas_id),
                        vec![panel::content::set(panel.content)],
                    )
                    .exec()
                    .await
                    .unwrap()
            })
        })
        .mutation("delete", |t| {
            t(|ctx: Ctx, panel_id: String| async move {
                ctx.client
                    .panel()
                    .delete(panel::id::equals(panel_id))
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .mutation("transform", |t| {
            t(|ctx: Ctx, update: PanelTransformUpdatePayload| async move {
                println!("{}", "executing panel transfrom");
                ctx.client
                    .panel()
                    .update_unchecked(panel::id::equals(update.id), update.transform.to_params())
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
        .mutation("set_content", |t| {
            t(|ctx: Ctx, update: PanelContentUpdatePayload| async move {
                println!("Attempting content update on {}", update.id);
                ctx.client
                    .panel()
                    .update(
                        panel::id::equals(update.id),
                        vec![panel::content::set(update.content)],
                    )
                    .exec()
                    .await
                    .map_err(Into::into)
            })
        })
}
