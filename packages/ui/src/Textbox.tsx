import { VariantProps, cva } from "class-variance-authority";
import TextEditor from "./TextEditor";
import { KeyboardEventHandler, useRef, useState } from "react";
import useDoubleClick from "use-double-click";
import clsx from "clsx";

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
  title: string;
  textBoxOptions?: {
    title: VariantProps<typeof textboxTitleVariants>;
  };
};

export function TextBox({}: TextBoxProps) {

  return (
    <div className={textboxVariants()}>
      <TextEditor features={{ typeahead: { lists: true, headings: true } }} className="rounded-md px-2 py-1 min-h-[150px] min-w=[150px]" />
    </div>
  );
}
