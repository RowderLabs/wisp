import { rspc, useUtils } from "@wisp/client";

export function useDeletePanel() {
  //TODO: move into custom hook and apply optimistic updates.
  const utils = useUtils();
  const { mutate: deletePanel } = rspc.useMutation("panels.delete", {
    onSuccess: () => {
      utils.invalidateQueries(["characters.canvas"]);
    },
  });

  return {deletePanel}
}
