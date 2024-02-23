import { ZodError, z } from "zod";
import { PanelContract } from "@wisp/ui";
import { ReactElement, JSXElementConstructor } from "react";
import { FactSheet } from "../components/FactSheet";
import { FactSheetJSONSchema } from "../schema/fact";

type FactSliceServerProps = z.infer<typeof FactSheetJSONSchema>;

export class FactSlicePanel implements PanelContract<any, FactSliceServerProps> {
  //private __props: unknown
  private __serverProps?: FactSliceServerProps;

  getType() {
    return "factsheet";
  }
  getClientProps(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    props: any
  ): Omit<PanelContract<any, { src: string } | null>, "getClientProps"> {
    return this;
  }
  getServerProps(
    json: string | null
  ): Omit<PanelContract<any, { src: string } | null>, "fromJSON"> {
    if (!json) return this;
    try {
      this.__serverProps = FactSheetJSONSchema.parse(JSON.parse(json));
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(error.flatten())
      }
    }

    return this;
  }
  render(): ReactElement<unknown, string | JSXElementConstructor<any>> | null {
    if (!this.__serverProps) return null;

    return <FactSheet {...this.__serverProps} />;
  }
}
