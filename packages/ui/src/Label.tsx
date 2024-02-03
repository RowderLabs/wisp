import React, { PropsWithChildren } from "react";
import * as RadixLabel from "@radix-ui/react-label";

interface LabelProps extends RadixLabel.LabelProps {}

export function Label({ children, ...props }: PropsWithChildren<LabelProps>) {
  return <RadixLabel.Root className="text-sm" {...props}>{children}</RadixLabel.Root>;
}
