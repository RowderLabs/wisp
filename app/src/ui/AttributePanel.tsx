
import React, { FC, PropsWithChildren } from "react";

type AttributePanelProps = {
  attributes: {
    attributeValue: string,
    attribute: {
      id: number,
      label: string,
      attribute_group: string
    }
  }[]
}


const AttributePanel: React.FC<PropsWithChildren<AttributePanelProps>> = ({attributes}) => {
  return (
    <div className="w-[400px] flex flex-col gap-4 rounded-md border p-6">
      {attributes.map((item) => (
         <AttributePanelItem {...item} />
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

type AttributePanelItemProps = AttributePanelProps['attributes'][0]

const AttributePanelItem = ({ attributeValue, attribute }: AttributePanelItemProps) => {
  return (
    <div className="text-sm grid gap-6 grid-cols-2 break-words border-b">
      <p>{attribute.label}</p>
      <p>{attributeValue}</p>
    </div>
  );
};

export { AttributePanel, AttributePanelItem };
