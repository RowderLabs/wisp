import React from "react";
import { Procedures } from "./bindings";
import { rspc, queryClient, client } from "./rspc";
import { Client } from "@rspc/client";
import { QueryClient, SetDataOptions } from "@tanstack/react-query";

type ProcedureKey = Procedures["queries"]["key"];
type ProcedureQuery<TKey extends Procedures["queries"]["key"]> = Extract<Procedures["queries"], { key: TKey }>;

type QueryKey = [Procedures["queries"]["key"]];
type QueryKeyAndInput<TKey extends Procedures["queries"]["key"]> = [TKey, ProcedureQuery<TKey>["input"]];
type T1 = QueryKeyAndInput<"facts.on_entity">;

type QueryResultFromKey<Tkey extends Procedures["queries"]["key"]> = ProcedureQuery<Tkey>["result"];

type T2 = QueryResultFromKey<"characters.tree">;

export function useUtils() {
  const queryClient = rspc.useContext().queryClient;

  const invalidateQueries = React.useCallback(<TKey extends ProcedureKey>(queryKey: QueryKey | QueryKeyAndInput<TKey>) => {
    queryClient.invalidateQueries({ queryKey });
  }, []);

  const getQueryData = React.useCallback(
    <TKey extends ProcedureKey, U extends QueryResultFromKey<TKey>>(queryKeyAndInput: QueryKeyAndInput<TKey>) => {
      console.log(queryKeyAndInput)
      return queryClient.getQueryData<U>(queryKeyAndInput);
    },
    []
  );

  type T3 = Parameters<typeof queryClient.setQueryData>;

  const setQueryData = React.useCallback(
    <TKey extends ProcedureKey, U extends QueryResultFromKey<TKey>>(
      queryKeyAndInput: QueryKeyAndInput<TKey>,
      updater: U,
      options?: SetDataOptions
    ) => {
      return queryClient.setQueryData<U>(queryKeyAndInput, updater, options);
    },
    []
  );

  const utils = {
    invalidateQueries,
    getQueryData,
    setQueryData
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
