import { rspc } from "../rspc/router";

export function useDeleteCharacter() {
  const queryClient = rspc.useContext().queryClient;
  const { mutate: deleteCharacter, error } = rspc.useMutation("characters.delete_with_name", {
    onSuccess: (character) => {
      queryClient.invalidateQueries(["characters.with_id", character.id]);
      queryClient.invalidateQueries(["binder.characters", null]);
    },
  });

  return {
   deleteCharacter,
   error
  }


}