import { useDialogsContext } from "./useDialogsContext";

export const useDialogManager = () => {
  const { createDialog, removeDialog } = useDialogsContext();

  return [
    {
      createDialog,
      removeDialog,
    },
  ] as const;
};
