import * as RadixDialog from "@radix-ui/react-dialog";
import React, { PropsWithChildren } from "react";

type ModalProps = {
  trigger: React.ReactNode
}

export function Modal({trigger,children}: PropsWithChildren<ModalProps>) {
  return (
    <RadixDialog.Root>
      <RadixDialog.Trigger >
        {trigger}
      </RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed pointer-events-none bg-black/25 inset-0"/>
        <RadixDialog.Content>
          <div className="fixed top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-white rounded-md shadow-xl">
            {children}
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}