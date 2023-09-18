import { CharacterCollection } from "../rspc/bindings";
import { rspc } from "../rspc/router";

export const useBinder = () => {
  //const {data: characters} = rspc.useQuery(['binder.characters', null])
  const characters: { [key: string]: CharacterCollection[] } = {
    "/": [{ id: 1, name: "Root", path: null }, {id: 4, name: 'Other at Root', path: null}],
    "/1": [{ id: 2, name: "Nested", path: "/1" }],
    "/1/2": [{ id: 3, name: "Nested Deep", path: "/1/2" }],
    "/4": [{id: 5, name: 'Nested second', path: '/4'}]
  };

  return { characters };
};
