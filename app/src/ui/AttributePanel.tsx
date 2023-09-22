import React, { FC, PropsWithChildren } from "react";

const data = [
  {
    id: 1,
    name: "Basic Info",
    attrs: [
      { id: 1, label: "Age", attribute: 22 },
      { id: 2, label: "Occupation", attribute: "Blacksmith" },
    ],
  },
];

const AttributePanel: React.FC<PropsWithChildren> = () => {
  return (
    <div className="w-[400px] flex flex-col gap-4 rounded-md border p-6">
      {data.map((group) => (
        <AttributePanelGroup key={group.id} name={group.name}>
          {group.attrs.map((attr) => (
            <AttributePanelItem key={attr.id} label={attr.label} attribute={attr.attribute} />
          ))}
        </AttributePanelGroup>
      ))}
    </div>
  );
};

type AttributePanelGroupProps = {
  name: string;
};

const AttributePanelGroup: FC<PropsWithChildren<AttributePanelGroupProps>> = ({ children, name }) => {
  return (
    <>
      <div className="px-4 font-semibold bg-blue-500 text-white py-2 rounded-md">
        <p>{name}</p>
      </div>
      <div className="px-4 flex flex-col gap-4">{children}</div>
    </>
  );
};

type AttributePanelItemProps = {
  label: string;
  attribute: any;
};

const AttributePanelItem = ({ label, attribute }: AttributePanelItemProps) => {
  return (
    <div className="text-sm grid gap-6 grid-cols-2 break-words border-b">
      <p>{label}</p>
      <p>{attribute}</p>
    </div>
  );
};

export { AttributePanel, AttributePanelItem };
