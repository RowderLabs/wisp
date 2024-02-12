import React from "react";
import { Procedures } from "./bindings";
import { rspc, queryClient, client } from "./rspc";
import { Client } from "@rspc/client";
import { QueryClient } from "@tanstack/react-query";

type QueryKey = [Procedures["queries"]["key"], ...unknown[]];
type QueryKeyAndInput<TKey extends Procedures["queries"]["key"]> = [
  TKey,
  ...Extract<Procedures["queries"], { key: TKey }>["input"][]
];

type QueryResultFromKey<Tkey extends Procedures["queries"]["key"]> = Extract<
  Procedures["queries"],
  { key: Tkey }
>["result"];

export function useUtils() {
  const invalidateQueries = React.useCallback((queryKey: QueryKey) => {
    queryClient.invalidateQueries(queryKey);
  }, []);

  const utils = {
    invalidateQueries,
  };

  return utils;
}

export class RSPCUtils {
  client: Client<Procedures>;
  queryClient: QueryClient;

  constructor(client: Client<Procedures>, queryClient: QueryClient) {
    this.client = client;
    this.queryClient = queryClient;
  }
  ensureQueryData<Tkey extends Procedures["queries"]["key"] & string>(
    query: QueryKeyAndInput<Tkey>
  ): Promise<QueryResultFromKey<Tkey>> {
    const [key, input] = query;
    return queryClient.ensureQueryData({
      queryKey: [key, input],
      queryFn: () => client.query([key as any, input as any]),
    });
  }
}
