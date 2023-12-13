import { VariantProps, cva } from "class-variance-authority";
import TextEditor from "./TextEditor";
import { EditableInline } from "./EditableInline";
import { KeyboardEventHandler, useRef, useState } from "react";
import useDoubleClick from "use-double-click";
import clsx from "clsx";

const textboxVariants = cva("bg-white border rounded-md p-2");
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

export function TextBox({ title, textBoxOptions }: TextBoxProps) {
  const titleRef = useRef<HTMLDivElement | null>(null);
  

  useDoubleClick({
    ref: titleRef,
    onDoubleClick: () => {
      setEditing(true);
    },
    latency: 250,
  });
  const [editing, setEditing] = useState(false);
  const handleSubmit: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === "Enter") {
      setEditing(false);
      titleRef.current?.blur()
    }
  };
  return (
    <div className={textboxVariants()}>
      <div className={textboxTitleVariants({ ...textBoxOptions?.title })}>
        <div
          role="textbox"
          className={clsx(editing ? "select-text" : "select-none", 'focus:outline-none')}
          ref={titleRef}
          tabIndex={0}
          onKeyDown={handleSubmit}
          contentEditable={editing}
        >
          {title}
        </div>
        <span>{editing}</span>
      </div>
      <TextEditor features={{ typeahead: { lists: true } }} className="p-2 rounded-md w-[300px] h-[250px]" />
    </div>
  );
}
