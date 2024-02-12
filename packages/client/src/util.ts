import React from "react";
import { Procedures } from "./bindings";
import { queryClient, rspc } from "./rspc";

type QueryKey = [Procedures["queries"]["key"], ...unknown[]];
;//type QueryResult<TKey extends Procedures['queries']['key']>= Extract<Procedures["queries"], { key: TKey}>["result"];

export function useUtils() {
  const invalidateQueries = React.useCallback((queryKey: QueryKey) => {
    queryClient.invalidateQueries(queryKey);
  }, []);

  const utils = {
    invalidateQueries,
  };

  return utils;
}
