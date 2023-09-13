import { BinderNode } from "../components/Node";
import { rspc } from "../rspc/router";
import {HiUser} from 'react-icons/hi'


export default function useBinderData() {
  const { data: characters } = rspc.useQuery(["binder.characters"], {
    select: (data) =>
      data.map(
        (c) =>
          ({
            id: c.id,
            name: c.name,
            icon: <HiUser/>
          } as unknown as BinderNode)
      ),
  });


  return {characters}

}