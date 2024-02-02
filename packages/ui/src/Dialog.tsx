import * as RadixDialog from "@radix-ui/react-dialog";
import { ScopeProvider } from "bunshi/react";
import React, { PropsWithChildren } from "react";
import { DialogProviderScope } from "./molecules/dialog";


export interface DialogProps extends RadixDialog.DialogProps {
  trigger: React.ReactNode;
};

export type DialogPropKeys = keyof RadixDialog.DialogProps | keyof DialogProps

export function Dialog({ trigger, children, open, onOpenChange, ...radixProps }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} {...radixProps}>
      <RadixDialog.Trigger>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed pointer-events-none bg-black/25 inset-0" />
        <RadixDialog.Content>
          <div className="fixed top-1/2 left-1/2 -translate-y-1/2 p-4 -translate-x-1/2 min-w-[200px] min-h-[250px] bg-white rounded-md shadow-md">
            {children}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}


/*
{
  'iwejor': {active: true},
  'werwi: {active: false}
}

*/




export function DialogProvider({ children }: PropsWithChildren) {
  return <ScopeProvider scope={DialogProviderScope}>{children}</ScopeProvider>;
}
type UseDialogProps = {
  id: string;
};




