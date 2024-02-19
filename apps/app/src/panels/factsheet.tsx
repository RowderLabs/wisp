import { z } from "zod";
import { PanelContract } from "@wisp/ui";
import React, { ReactElement, JSXElementConstructor } from "react";
import { FactSheet } from "../components/FactSheet";

const FactSchema = z.union([
  z.object({
    type: z.enum(["text"]),
    factKey: z.string(),
    value: z.string(),
  }),
  z.object({
    type: z.enum(["attr"]),
    factKey: z.string(),
    value: z.array(z.string()),
  }),
]);

const FactSheetJSONSchema = z.object({
  facts: z.array(FactSchema),
});

type FactSheetServerProps = z.infer<typeof FactSheetJSONSchema>;

export class FactSheetPanel implements PanelContract<any, FactSheetServerProps> {
  //private __props: unknown
  private __serverProps?: React.ComponentPropsWithoutRef<typeof FactSheet>;

  getType() {
    return "factsheet";
  }
  getClientProps(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    props: any
  ): Omit<PanelContract<any, { src: string } | null>, "getClientProps"> {
    return this;
  }
  getServerProps(json: string | null): Omit<PanelContract<any, { src: string } | null>, "fromJSON"> {
    if (!json) return this;
    try {
      this.__serverProps = FactSheetJSONSchema.parse(JSON.parse(json));
    } catch (error) {
      console.error(error);
    }

    return this;
  }
  render(): ReactElement<unknown, string | JSXElementConstructor<any>> | null {
    if (!this.__serverProps) return null;

    return <FactSheet {...this.__serverProps} />;
  }
}
