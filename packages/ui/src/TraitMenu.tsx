import { Menu, MenuItem } from "./Menu";
import { Dialog} from "./Dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { useState } from "react";

type TraitMenuProps = {
  trigger: React.ReactNode
}

export default function TraitMenu({trigger}: TraitMenuProps) {
  const [traitGroups, _setTraitGroups] = useState([{ name: "Basic Info" }, { name: "Personality" }]);
  const [traits, _setTraits] = useState([
    { name: "Full Name", group: "Basic Info" },
    { name: "Age", group: "Basic Info" },
    { name: "Nickname", group: "Basic Info" },
    { name: "Personality Trait", group: "Personality" },
  ]);

  return (
    <Dialog trigger={trigger}>
      <Tabs.Root defaultValue={traitGroups[0].name} className="flex px-4 py-6 gap-4 h-full">
        <Tabs.List className="flex flex-col items-start h-full gap-2 basis-[200px] border-r-2 pr-4">
          {traitGroups.map((group) => (
            <Tabs.Trigger className="p-2 border-b-2 w-full text-left" key={group.name} value={group.name}>
              {group.name}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {traitGroups.map((group) => (
          <Tabs.Content key={group.name} value={group.name} className="max-h-[400px] overflow-auto basis-full">
            {/**Header*/}
            <div className="flex w-full items-start justify-between mb-4">
              {/**Header Left*/}
              <div>
                <p className="font-semibold text-lg">Personal Information</p>
                <div className="flex gap-4 text-blue-400">
                  <button>+ Add Note</button>
                  <button>+ Add Bio</button>
                </div>
              </div>
              {/**Header Right*/}
              <button className="mt-2 rounded-md border-2 border-blue-200 bg-blue-100 px-5 py-1 hover:bg-blue-200 hover:shadow-md">
                Add Trait
              </button>
            </div>
            {/*Traits*/}
            <Menu className="flex flex-col gap-4 px-2">
              {traits
                .filter((trait) => trait.group === group.name)
                .map((t) => (
                  <MenuItem key={t.name} className="flex justify-between">
                    <div>
                      <span>{t.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <input type="text" className="w-96 border-4 border-dotted" />
                      <button className="text-slate-400">✓</button>
                      <button className="text-red-400">✗</button>
                    </div>
                  </MenuItem>
                ))}
            </Menu>
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Dialog>
  );
}
