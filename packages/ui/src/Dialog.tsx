/* eslint-disable @typescript-eslint/no-unused-vars */
import * as RadixDialog from "@radix-ui/react-dialog";
import { ScopeProvider } from "bunshi/react";
import React, { PropsWithChildren } from "react";
import { DialogProviderScope } from "./molecules/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useDialogsContext } from "./hooks";

export interface DialogProps extends RadixDialog.DialogProps, RadixDialog.DialogContentProps {
  id: string;
  trigger?: React.ReactNode;
}

export type DialogPropKeys = keyof RadixDialog.DialogProps | keyof DialogProps;

export function Dialog({
  id,
  trigger,
  children,
  open,
  onOpenChange,
  defaultOpen,
  modal,
  ...radixProps
}: DialogProps) {
  const { unregisterDialog } = useDialogsContext();
  const unregister = React.useCallback(() => {
    unregisterDialog(id);
  }, [id, unregisterDialog]);
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} {...radixProps}>
      <RadixDialog.Trigger asChild>{trigger}</RadixDialog.Trigger>
      <AnimatePresence onExitComplete={unregister}>
        {open && (
          <RadixDialog.Portal forceMount>
            <RadixDialog.Overlay asChild />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.15 } }}
              exit={{ opacity: 0, transition: { duration: 0.15} }}
              className="fixed z-[101] m-[1px] !pointer-events-none bg-black/20 inset-0 grid place-items-center"
            >
              <RadixDialog.Content onInteractOutside={radixProps.onInteractOutside} asChild>
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="min-w-[100px] bg-white rounded-md shadow-sm"
                >
                  {children}
                </motion.div>
              </RadixDialog.Content>
            </motion.div>
          </RadixDialog.Portal>
        )}
      </AnimatePresence>
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
