import { VariantProps, cva } from "class-variance-authority";
import TextEditor from "./TextEditor";

const textboxVariants = cva("bg-white border rounded-md p-2");
const textboxTitleVariants = cva("text-slate-800", {
  variants: {
    position: {
      center: "text-center",
      left: "text-left",
      right: "text-right",
    },
  },
  defaultVariants: {
    position: "center",
  },
});

export type TextBoxProps = {
  title: string
  textBoxOptions?: {
    title: VariantProps<typeof textboxTitleVariants>
  }
};

export function TextBox({ title, textBoxOptions }: TextBoxProps) {
  return (
    <div className={textboxVariants()}>
      <p className={textboxTitleVariants({ ...textBoxOptions?.title })}>{title}</p>
      <TextEditor
        features={{ typeahead: { lists: true } }}
        className="p-2 rounded-md w-[300px] h-[150px]"
      />
    </div>
  );
}
