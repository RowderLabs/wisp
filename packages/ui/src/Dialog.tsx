import * as RadixDialog from "@radix-ui/react-dialog";
import { ScopeProvider } from "bunshi/react";
import React, { PropsWithChildren } from "react";
import { DialogProviderScope } from "./molecules/dialog";
import { AnimatePresence, motion } from "framer-motion";
import { useDialogManager, useDialogsContext } from "./hooks";

export interface DialogProps extends RadixDialog.DialogProps {
  id: string;
  trigger: React.ReactNode;
}

export type DialogPropKeys = keyof RadixDialog.DialogProps | keyof DialogProps;

export function Dialog({
  id,
  trigger,
  children,
  open,
  onOpenChange,
  defaultOpen,
  ...radixProps
}: DialogProps) {
  const { unregisterDialog } = useDialogsContext();
  const unregister = React.useCallback(() => {
    unregisterDialog(id);
  }, []);
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
              className="fixed pointer-events-none bg-black/10 inset-0"
            >
              <RadixDialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.15 } }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  className="fixed top-1/2 left-1/2 -translate-y-1/2 p-4 -translate-x-1/2 min-w-[200px] min-h-[250px] bg-white rounded-md shadow-md"
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
