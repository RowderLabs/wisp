import React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { Menu, MenuItem } from "./Menu";

export const CharacterCreationModal = () => {
  return (
    <RadixDialog.Root>
      <RadixDialog.Trigger asChild>
        <button>Open</button>
      </RadixDialog.Trigger>
      <RadixDialog.Portal>
        <RadixDialog.Overlay />
        <RadixDialog.Content className="rounded-md bg-white border p-8 fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%] z-[1000]">
          <RadixDialog.Title className="mb-4 text-xl"> Edit Character</RadixDialog.Title>
          <div className="flex gap-4">
            <div>
              <Menu>
                <MenuItem>Primary Attributes</MenuItem>
                <MenuItem>Occupation</MenuItem>
              </Menu>
            </div>
            <div className="w-[400px] border">

            </div>
          </div>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
