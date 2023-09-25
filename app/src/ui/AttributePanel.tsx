import React, { FC, PropsWithChildren, useEffect, useMemo } from "react";

type AttributePanelProps = {
  attributes: {
    attributeValue: string;
    attribute: {
      id: number;
      label: string;
      attribute_group: string;
    };
  }[];
};

type AttributeGroups = {
  [key: string]: { id: number; label: string; attributeValue: string }[];
};

const AttributePanel: React.FC<PropsWithChildren<AttributePanelProps>> = ({ attributes }) => {
  const grouped = attributes.reduce((group, next) => {
    const { attribute_group, label, id } = next.attribute;
    group[attribute_group] = group[attribute_group] || [];
    group[attribute_group].push({ id, label, attributeValue: next.attributeValue });
    return group;
  }, {} as AttributeGroups);

  useEffect(() => {
    console.log(grouped);
  }, [grouped]);
  return (
    <div className="w-[400px] flex flex-col gap-4 rounded-md border p-6">
      {Object.entries(grouped).map((entry) => (
        <AttributePanelGroup name={entry[0]} attributes={entry[1]} />
      ))}
    </div>
  );
};

const AttributePanelGroup: FC<{ name: string; attributes: AttributeGroups[0] }> = ({
  name,
  attributes,
}) => {
  return (
    <>
      <div className="px-4 font-semibold bg-blue-500 text-white py-2 rounded-md">
        <p className="capitalize">{name}</p>
      </div>
      <div className="px-4 flex flex-col gap-4">
        {attributes.map((attr) => (
          <AttributePanelItem
            key={attr.id}
            label={attr.label}
            id={attr.id}
            attributeValue={attr.attributeValue}
          />
        ))}
      </div>
    </>
  );
};

type AttributePanelItemProps = {
  id: number;
  label: string;
  attributeValue: string;
};
const AttributePanelItem = ({ attributeValue, label }: AttributePanelItemProps) => {
  return (
    <div className="text-sm grid gap-6 grid-cols-2 break-words border-b">
      <p>{label}</p>
      <p>{attributeValue}</p>
    </div>
  );
};

export { AttributePanel, AttributePanelItem };
