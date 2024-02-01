import * as RadixDialog from "@radix-ui/react-dialog";
import { ScopeProvider, createScope, molecule, useMolecule } from "bunshi/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { PropsWithChildren } from "react";

type ModalProps = {
  trigger: React.ReactNode;
} & RadixDialog.DialogProps;

export function Modal({ trigger, children, open, onOpenChange, ...radixProps }: ModalProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} {...radixProps}>
      <RadixDialog.Trigger>{trigger}</RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed pointer-events-none bg-black/25 inset-0" />
        <RadixDialog.Content>
          <div className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-white rounded-md shadow-xl">
            {children}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

const DialogProviderScope = createScope(undefined);

type DialogState = {
  active: boolean;
};
/*
{
  'iwejor': {active: true},
  'werwi: {active: false}
}
*/
const DialogMolecule = molecule((_, scope) => {
  scope(DialogProviderScope);
  const $dialogs = atom<Record<string, DialogState>>({});
  const $registerDialog = atom(null, (get, set, update: { id: string }) => {
    const dialogs = get($dialogs)
    //todo: add warning
    if (dialogs[update.id]) return;
    set($dialogs, { ...get($dialogs), [`${update.id}`]: { active: true } })
  }
  );

  const $readDialogs = atom((get) => get($dialogs));
  const $unregisterDialog = atom(null, (get, set, update: { id: string }) => {
    const dialogs = { ...get($dialogs) };
    const subject = dialogs[update.id]
    //todo: throw error here
    if (!subject) return;
    delete dialogs[update.id];
    set($dialogs, dialogs);
  });

  const $toggleDialog = atom(null, (get, set, update: { id: string; visibility?: boolean }) => {
    const dialogs = { ...get($dialogs) };
    const subject = dialogs[update.id];

    //todo: throw error here
    if (!subject) return;
    if (update.visibility) {
      subject.active = update.visibility;
      set($dialogs, dialogs);
      return;
    }

    subject.active = !dialogs[update.id].active;
    set($dialogs, dialogs);
  });

  return { $registerDialog, $unregisterDialog, $toggleDialog, $readDialogs };
});

export function DialogProvider({ children }: PropsWithChildren) {
  return <ScopeProvider scope={DialogProviderScope}>{children}</ScopeProvider>;
}

export const useDialogs = () => {
  const {$readDialogs, $registerDialog, $unregisterDialog, $toggleDialog} = useMolecule(DialogMolecule);
  const dialogs = useAtomValue($readDialogs)
  const registerDialog = useSetAtom($registerDialog)
  const removeDialog = useSetAtom($unregisterDialog)
  const show = useSetAtom($toggleDialog)

  return {dialogs, registerDialog, removeDialog, show}
};
