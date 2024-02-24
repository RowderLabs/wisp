import { z } from "zod";
import { TextBox, TextBoxProps } from "../src/Textbox";
import { Panel, PanelContract } from "./base";
import { ReactElement, JSXElementConstructor } from "react";

const TextboxPanelJSONSchema = z
  .object({
    initial: z.string(),
  })
  .nullable();

type ITextboxPanelJSONProps = z.infer<typeof TextboxPanelJSONSchema>;

export class TextboxPanel implements PanelContract<Omit<TextBoxProps, "initial">, ITextboxPanelJSONProps> {
  private __props?: Omit<TextBoxProps, "initial">;
  private __serverProps?: ITextboxPanelJSONProps;

  getType() {
    return "textbox";
  }
  getClientProps(props: Omit<TextBoxProps, "initial">) {
    this.__props = props;
    return this;
  }
  getServerProps(
    json: string | null
  ): Omit<PanelContract<Omit<TextBoxProps, "initial">, { initial: string } | null>, "fromJSON"> {
    if (!json) return this;

    try {
      this.__serverProps = TextboxPanelJSONSchema.parse(textEditorParser(json));
    } catch (error) {
      console.error("could not parse textbox schema");
    }

    return this;
  }
  render(): ReactElement<unknown, string | JSXElementConstructor<any>> | null {

    return <TextBox {...this.__serverProps} {...this.__props} />;
  }
}

const textEditorParser = (text: string) =>
  JSON.parse(text, (key, val) => {
    if (key === "initial") return JSON.stringify(val);
    return val;
  });

