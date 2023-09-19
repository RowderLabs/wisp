import { useEffect } from "react";
import { CharacterCollection } from "../rspc/bindings";
import { rspc } from "../rspc/router";

export const useBinder = () => {
  const {data: characters} = rspc.useQuery(['binder.characters', null])
  return { characters };
};
