import { rspc } from "../rspc/router";

export function useEditCharacter() {
  const queryClient = rspc.useContext().queryClient;
  const { mutate: changeName } = rspc.useMutation("characters.change_name", {
    onSuccess: (character) => {
      queryClient.invalidateQueries(["characters.with_id", character.id]);
      queryClient.invalidateQueries(["binder.characters", null]);
    },
  });

  return {
   changeName 
  }


}