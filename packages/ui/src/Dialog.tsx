import * as RadixDialog from "@radix-ui/react-dialog";
import { dialog } from "@tauri-apps/api";
import { ScopeProvider, createScope, molecule, useMolecule } from "bunshi/react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import React, { PropsWithChildren, useEffect } from "react";

export type DialogProps = {
  trigger: React.ReactNode;
} & RadixDialog.DialogProps;

export function Dialog({ trigger, children, open, onOpenChange, ...radixProps }: DialogProps) {
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
  component: React.FC<any>;
  props: any;
};
/*
{
  'iwejor': {active: true},
  'werwi: {active: false}
}

*/
const UNKNOWN_FAILURE_CAUSE = "the manager failed for an unknown reason" as const;
type FirstParam<T extends (...args: any) => any> = Parameters<T>[0];
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

  const safeModifyDialogs = <TFunc extends (arg: any) => any, UParam extends FirstParam<TFunc>>(
    callback: TFunc,
    param: UParam
  ) => {
    try {
      callback(param);
    } catch (err) {
      if (err instanceof DialogManagerError) {
        console.error(formatLogMessage(err.type, err.message));
      }
    }
  };

  const $registerDialog = atom(
    null,
    (get, set, update: { id: string; component: React.FC<any>; props: any }) => {
      const dialogs = get($dialogs);
      const subject = dialogs[update.id];
      //todo: add warning
      if (subject) {
        throw new DialogManagerError(
          createManagerErrorMessage({
            action: `register dialog ${update.id}`,
            errorCause: `dialog ${update.id} already exists.`,
          }),
          "REGISTER_ERROR"
        );
      }
      console.log(update.component);
      set($dialogs, {
        ...get($dialogs),
        [`${update.id}`]: { active: true, component: update.component, props: update.props },
      });
    }
  );

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

  return { $registerDialog, $unregisterDialog, $dialogsState, safeModifyDialogs };
});

export function DialogProvider({ children }: PropsWithChildren) {
  return <ScopeProvider scope={DialogProviderScope}>{children}</ScopeProvider>;
}
type UseDialogProps = {
  id: string;
};

export function useDialogsContext() {
  const { $dialogsState, $unregisterDialog, safeModifyDialogs } = useMolecule(DialogMolecule);
  const dialogs = useAtomValue($dialogsState);

  const _unregisterDialog = useSetAtom($unregisterDialog);

  const safeUnregister = React.useCallback((id: string) => {
    safeModifyDialogs(_unregisterDialog, { id });
  }, []);

  //todo: close all dialogs
  return { dialogs, unregisterDialog: safeUnregister };
}

export const useDialogManager = () => {
  const { $dialogsState, $registerDialog, $unregisterDialog, safeModifyDialogs } =
    useMolecule(DialogMolecule);

  const { unregisterDialog } = useDialogsContext();
  const _registerDialog = useSetAtom($registerDialog);

  //TODO: move component arg back to here.
  const safeRegister = React.useCallback(
    <C extends React.FC<any>, P extends Omit<React.ComponentPropsWithoutRef<C>, keyof DialogProps>>(
      component: C,
      args: P & { id: string }
    ) => {
      safeModifyDialogs<typeof _registerDialog, FirstParam<typeof _registerDialog>>(
        _registerDialog,
        { id: args.id, component, props: { ...args } }
      );
    },
    []
  );

  return [
    {
      createDialog: safeRegister,
      removeDialog: unregisterDialog,
    },
  ] as const;
};
