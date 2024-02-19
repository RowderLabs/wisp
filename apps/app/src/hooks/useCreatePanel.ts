import { rspc, useUtils } from "@wisp/client";

type PanelType = 'textbox' | 'image' | 'factsheet'

export function useCreatePanel(id: string) {
  const utils = useUtils();

  const { mutate: createPanel } = rspc.useMutation(["panels.create"], {
    onSuccess: () => {
      utils.invalidateQueries(["characters.canvas"]);
    },
  });
  type T1 = Omit<Partial<Parameters<typeof createPanel>[0]>, "panel_type">;

  const createPanelWithType = (type: PanelType, args?: T1) => {
    createPanel({
      x: args?.x ?? Math.floor(Math.random() * (400 - 150 + 1)) + 150,
      y: args?.y ?? Math.floor(Math.random() * (400 - 150 + 1)) + 150,
      width: args?.width ?? 300,
      height: args?.height ?? 300,
      panel_type: type,
      canvas_id: id,
      content: args?.content || null,
    });
  };

  return createPanelWithType;
}
