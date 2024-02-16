import { rspc, useUtils } from "@wisp/client";

export function useDeleteCharacter() {
  const utils = useUtils()
  const { mutate: deleteCharacter } = rspc.useMutation("characters.delete", {
    onSuccess: (character) => {
      utils.invalidateQueries(["characters.build_tree"]);
      utils.invalidateQueries(['characters.canvas'])
      utils.invalidateQueries(['characters.find'])
      utils.invalidateQueries(['characters.with_id', character.id])
    },
  });

  return {deleteCharacter}
}