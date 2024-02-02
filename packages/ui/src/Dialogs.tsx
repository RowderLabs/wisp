import React from "react";
import { DialogProps } from "./Dialog";
import { useDialogsContext } from "./hooks/useDialogsContext";

export function Dialogs() {
  const { dialogs, unregisterDialog, removeDialog } = useDialogsContext();

  const renderDialogs = React.useMemo(() => {
    return Object.keys(dialogs).map((id) => {
      const Dialog: React.FC<
        any & { open: DialogProps["open"]; onOpenChange: DialogProps["onOpenChange"] }
      > = dialogs[id].component;

      return (
        <Dialog
          {...dialogs[id].props}
          open={dialogs[id].active}
          key={id}
          onOpenChange={() => removeDialog(id)}
        />
      );
    });
  }, [dialogs]);

  return renderDialogs;
}
