import { useMolecule } from "bunshi/react";
import { useAtomValue, useSetAtom } from "jotai";
import React from "react";
import { DialogMolecule } from "../molecules/dialog";

export function useDialogsContext() {
    const { $dialogsState, $unregisterDialog, _safeModifyDialogs } = useMolecule(DialogMolecule);
    const dialogs = useAtomValue($dialogsState);
  
    const _unregisterDialog = useSetAtom($unregisterDialog);
  
    const safeUnregister = React.useCallback((id: string) => {
      _safeModifyDialogs(_unregisterDialog, { id });
    }, []);
  
    //todo: close all dialogs
    return { dialogs, unregisterDialog: safeUnregister };
  }