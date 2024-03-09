import { useNavigate } from "@tanstack/react-router";
import { rspc, useUtils } from "@wisp/client";

export function useDeleteCharacter() {
  const utils = useUtils()
  const navigate = useNavigate()
  const { mutate: deleteCharacter } = rspc.useMutation('entity.delete', {
    onSuccess: () => {
      utils.invalidateQueries(['tree.characters']);
      utils.invalidateQueries(['canvas.for_entity'])
      navigate({to: '/workspace/'})
    },
  });

  return {deleteCharacter}
}