import { useMolecule } from "bunshi/react";
import { useAtomValue, useSetAtom } from "jotai";
import React from "react";
import { DialogMolecule, FirstParam } from "../molecules/dialog";
import { DialogPropKeys } from "../Dialog";

export function useDialogsContext() {
  const { $dialogsState, $unregisterDialog, _safeModifyDialogs, $toggleDialog, $registerDialog } =
    useMolecule(DialogMolecule);
  const dialogs = useAtomValue($dialogsState);

  const _unregisterDialog = useSetAtom($unregisterDialog);
  const _toggleDialog = useSetAtom($toggleDialog);
  const _registerDialog = useSetAtom($registerDialog);

  /**
   * This function allows toggle a dialog's visibility and will give a dialog error on failure.
   * @param id
   */
  const _safeToggleDialog = (id: string) => {
    _safeModifyDialogs<typeof _toggleDialog, FirstParam<typeof _toggleDialog>>(_toggleDialog, {
      id,
    });
  };

  const _safeUnregister = (id: string) => {
    _safeModifyDialogs(_unregisterDialog, { id });
  };

  const _safeRegisterDialog = <C extends React.FC<any>>(
    component: C,
    args: Omit<React.ComponentPropsWithoutRef<C>, DialogPropKeys> & { id: string }
  ) => {
    _safeModifyDialogs<typeof _registerDialog, FirstParam<typeof _registerDialog>>(
      _registerDialog,
      { id: args.id, component, props: { ...args } }
    );
    _safeToggleDialog(args.id);
  };

  const toggleDialog = React.useCallback(_safeToggleDialog, []);
  const safeRegister = React.useCallback(_safeRegisterDialog, []);
  const safeUnregister = React.useCallback(_safeUnregister, []);

  //todo: close all dialogs
  return {
    dialogs,
    unregisterDialog: safeUnregister,
    createDialog: safeRegister,
    //remove is toggle because dialog will auto open in register
    removeDialog: toggleDialog,
  };
}
