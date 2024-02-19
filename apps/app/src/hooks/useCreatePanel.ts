import { rspc, useUtils } from "@wisp/client";

export function useCreatePanel(id: string) {
  const utils = useUtils();

  const { mutate: createPanel } = rspc.useMutation(["panels.create"], {
    onSuccess: () => {
      utils.invalidateQueries(["characters.canvas"]);
    },
  });
  type T1 = Omit<Partial<Parameters<typeof createPanel>[0]>, "panel_type">;

  const createPanelWithType = (type: "textbox" | "image", args?: T1) => {
    createPanel({
      x: args?.x ?? 150,
      y: args?.y ?? 300,
      width: args?.width ?? 150,
      height: args?.height ?? 150,
      panel_type: type,
      canvas_id: id,
      content: null,
    });
  };

  return createPanelWithType;
}
