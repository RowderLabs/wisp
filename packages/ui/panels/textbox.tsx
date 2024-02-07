import { z } from "zod";
import { TextBox, TextBoxProps } from "../src/Textbox";
import { Panel } from "./base";

const TextboxPanelJSONSchema = z
  .object({
    initial: z.string(),
  })
  .nullable();

type ITextboxPanelJSONProps = z.infer<typeof TextboxPanelJSONSchema>;


export class TextboxPanel extends Panel<Omit<TextBoxProps, "initial">, ITextboxPanelJSONProps> {
  constructor(props: Omit<TextBoxProps, "initial">) {
    super(props);
  }

  renderFromJSON(json: string | null): React.ReactElement<TextBoxProps> | null {

    const textEditorParser = (text: string) => JSON.parse(text, (key, val) => {
      if (key === 'initial') return JSON.stringify(val)
      return val
    })
    
    const jsonProps = this.__parseJSONProps(json, TextboxPanelJSONSchema, textEditorParser);
    return jsonProps ? (
      //if exists pass initial
      <TextBox {...jsonProps} {...this.__props} />
    ) : (
      //else create textbox
      <TextBox initial={null} {...this.__props} />
    );
  }
}
