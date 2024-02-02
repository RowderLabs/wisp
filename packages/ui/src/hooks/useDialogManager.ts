import { useMolecule } from "bunshi/react";
import React from "react";
import { DialogMolecule, FirstParam } from "../molecules/dialog";
import { useDialogsContext } from "./useDialogsContext";
import { useSetAtom } from "jotai";
import { DialogProps } from "../Dialog";

export const useDialogManager = () => {
    const { $dialogsState, $registerDialog, _safeModifyDialogs } =
      useMolecule(DialogMolecule);
  
    const { unregisterDialog } = useDialogsContext();
    const _registerDialog = useSetAtom($registerDialog);
  
    //TODO: move component arg back to here.
    const safeRegister = React.useCallback(
      <C extends React.FC<any>, P extends Omit<React.ComponentPropsWithoutRef<C>, keyof DialogProps>>(
        component: C,
        args: P & { id: string }
      ) => {
        _safeModifyDialogs<typeof _registerDialog, FirstParam<typeof _registerDialog>>(
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