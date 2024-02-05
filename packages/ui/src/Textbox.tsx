import { VariantProps, cva } from "class-variance-authority";
import TextEditor from "./TextEditor";
import React from "react";

const textboxVariants = cva("bg-white overflow-clip border rounded-md p-2 w-full h-full");
const textboxTitleVariants = cva("text-slate-800 text-sm flex", {
  variants: {
    position: {
      center: "justify-center",
      left: "justify-start",
      right: "justify-end",
    },
  },
  defaultVariants: {
    position: "center",
  },
});

export type TextBoxProps = {
  textBoxOptions?: {
    title: VariantProps<typeof textboxTitleVariants>;
  };
};

export const TextBox: React.FC<TextBoxProps> = (props) => {
  return (
    <div className={textboxVariants()}>
      <TextEditor
        features={{ typeahead: { lists: true, headings: true } }}
        className="rounded-md px-2 py-1 min-h-[150px] min-w=[150px]"
      />
    </div>
  );
};
