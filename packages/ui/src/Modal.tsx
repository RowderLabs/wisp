import * as RadixDialog from "@radix-ui/react-dialog";
import { ScopeProvider, createScope, molecule, useMolecule } from "bunshi/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { PropsWithChildren, useEffect } from "react";

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
const UNKNOWN_FAILURE_CAUSE = "the manager failed for an unknown reason" as const;

type DialogErrorEnum = "REGISTER_ERROR" | "UNREGISTER_ERROR" | "ACTION_ERROR";
type DialogManagerErrorMessage =
  | `Attempted to ${string}, but ${string}`
  | `Attempted to ${string}, but`;

class DialogManagerError extends Error {
  timestamp: Date;
  type: DialogErrorEnum;

  constructor(message: DialogManagerErrorMessage, type: DialogErrorEnum) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.message = message;
    this.type = type;
    this.timestamp = new Date();
  }
}
const DialogMolecule = molecule((_, scope) => {
  scope(DialogProviderScope);
  const $dialogs = atom<Record<string, DialogState>>({});

  const createManagerErrorMessage = ({
    action,
    errorCause,
  }: {
    action: string;
    errorCause?: string;
  }): DialogManagerErrorMessage => {
    return `Attempted to ${action}, but ${errorCause ? errorCause : UNKNOWN_FAILURE_CAUSE}`;
  };

  const formatLogMessage = (type: DialogErrorEnum, message: string) => {
    return `[${type}]: ${message} [${new Date().toISOString()}]`;
  };

  const safeModifyDialogs = <
    TFunc extends (...args: any) => any,
    UParams extends Parameters<TFunc>
  >(
    callback: TFunc,
    ...params: UParams
  ) => {
    try {
      callback(...(params as any[]));
    } catch (err) {
      if (err instanceof DialogManagerError) {
        console.error(formatLogMessage(err.type, err.message));
      }
    }
  };

  const $registerDialog = atom(null, (get, set, update: { id: string }) => {
    const dialogs = get($dialogs);
    //todo: add warning
    if (dialogs[update.id]) {
      throw new DialogManagerError(
        createManagerErrorMessage({
          action: `register dialog ${update.id}`,
          errorCause: `dialog ${update.id} already exists.`,
        }),
        "REGISTER_ERROR"
      );
    }
    set($dialogs, { ...get($dialogs), [`${update.id}`]: { active: true } });
  });

  const $dialogsState = atom((get) => get($dialogs));
  const $unregisterDialog = atom(null, (get, set, update: { id: string }) => {
    const dialogs = { ...get($dialogs) };
    const subject = dialogs[update.id];
    //todo: throw error here
    if (!subject) {
      throw new DialogManagerError(
        createManagerErrorMessage({
          action: `unregister dialog ${update.id}`,
          errorCause: `dialog ${update.id} does not exist`,
        }),
        "UNREGISTER_ERROR"
      );
    }
    delete dialogs[update.id];
    set($dialogs, dialogs);
  });

  const $toggleDialog = atom(null, (get, set, update: { id: string; visibility?: boolean }) => {
    const dialogs = { ...get($dialogs) };
    const subject = dialogs[update.id];

    if (!subject) {
      throw new DialogManagerError(
        createManagerErrorMessage({
          action: `toggle dialog ${update.id}'s visibility`,
          errorCause: `dialog ${update.id} does not exist`,
        }),
        "UNREGISTER_ERROR"
      );
    }

    if (update.visibility !== undefined) {
      subject.active = update.visibility;
      set($dialogs, dialogs);
      return;
    }

    subject.active = !dialogs[update.id].active;
    set($dialogs, dialogs);
  });

  return { $registerDialog, $unregisterDialog, $toggleDialog, $dialogsState, safeModifyDialogs };
});

export function DialogProvider({ children }: PropsWithChildren) {
  return <ScopeProvider scope={DialogProviderScope}>{children}</ScopeProvider>;
}

export const useDialogs = () => {
  const { $dialogsState, $registerDialog, $unregisterDialog, $toggleDialog, safeModifyDialogs } =
    useMolecule(DialogMolecule);

  const dialogs = useAtomValue($dialogsState);
  const _registerDialog = useSetAtom($registerDialog);
  const _unregisterDialog = useSetAtom($unregisterDialog);
  const _toggleDialog = useSetAtom($toggleDialog);

  const safeRegister = React.useCallback(
    (...params: Parameters<typeof _unregisterDialog>) =>
      safeModifyDialogs(_registerDialog, ...params),
    []
  );

  const safeUnregister = React.useCallback(
    (...params: Parameters<typeof _unregisterDialog>) =>
      safeModifyDialogs(_unregisterDialog, ...params),
    []
  );

  const safeToggle = React.useCallback(
    (...params: Parameters<typeof _toggleDialog>) => safeModifyDialogs(_toggleDialog, ...params),
    []
  );

  return {
    dialogs,
    registerDialog: safeRegister,
    unregisterDialog: safeUnregister,
    toggleDialog: safeToggle,
  };
};
