import { rspc } from "../rspc/router";

export function useCreateCharacter() {
  const queryClient = rspc.useContext().queryClient;
  const { mutate: createCharacter } = rspc.useMutation("characters.create", {
    onSuccess: () => {
      queryClient.invalidateQueries(["binder.characters", null]);
    },
  });

  return {
    createCharacter,
  };
}
