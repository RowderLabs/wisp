import React from "react";
import { useDialogsContext } from "./Dialog";

export function Dialogs() {
  const { dialogs, unregisterDialog } = useDialogsContext();

  const renderDialogs = React.useMemo(() => {
    return Object.keys(dialogs).map((id) => {
      const Dialog = dialogs[id].component;

      return (
        <Dialog
          {...dialogs[id].props}
          open={dialogs[id].active}
          onOpenChange={() => unregisterDialog(id)}
        />
      );
    });
  }, [dialogs]);

  return renderDialogs;
}
