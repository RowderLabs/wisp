import { z } from "zod";
import { PanelContract } from '@wisp/ui';
import { ReactElement, JSXElementConstructor } from "react";
import { FactList } from "../routes/workspace.index";

const FactSheetJSONSchema = z.any()

type FactSheetServerProps = z.infer<typeof FactSheetJSONSchema>;

export class FactSheetPanel implements PanelContract<any, FactSheetServerProps> {
  private __props?: any
  private __serverProps?: FactSheetServerProps;

  getType() {
    return "image";
  }
  getClientProps(
    props: any 
  ): Omit<PanelContract<any, { src: string } | null>, "getClientProps"> {
    this.__props = props;
    return this;
  }
  getServerProps(json: string | null): Omit<PanelContract<any, { src: string } | null>, "fromJSON"> {
    if (!json) return this;
    try {
      this.__serverProps = FactSheetJSONSchema.parse(JSON.parse(json));
    } catch (error) {
      console.error("could not parse textbox schema");
    }

    return this;
  }
  render(): ReactElement<unknown, string | JSXElementConstructor<any>> | null {
    return <FactList/>;
  }
}
