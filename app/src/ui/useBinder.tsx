import * as React from "react";
import { rspc } from "../rspc/router";
import { UseQueryResult } from "@tanstack/react-query";
import { Procedures } from "../rspc/bindings";
import { RSPCError } from "@rspc/client";

type BinderContext = {
  characters: UseQueryResult<Extract<Procedures["queries"], { key: "binder.characters" }>["result"], RSPCError>;
};
const BinderContext = React.createContext<BinderContext | null>(null);

export const useBinderContext = () => {
  const binderContext = React.useContext(BinderContext);
  if (!binderContext) throw new Error("NO binder context provided");
  return binderContext;
};

export const BinderContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const characters = rspc.useQuery(["binder.characters"]);

  return <BinderContext.Provider value={{ characters }}>{children}</BinderContext.Provider>;
};
