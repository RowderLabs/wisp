import { z } from "zod";
import { PanelContract } from "./base";
import { Image, ImageProps } from "../src/Image";
import { ReactElement, JSXElementConstructor } from "react";

const ImagePanelJSONSchema = z
  .object({
    src: z.string(),
  })
  .nullable();

type ImagePanelJSONProps = z.infer<typeof ImagePanelJSONSchema>;
type ImagePanelProps = Omit<ImageProps, "src">;

export class ImagePanel implements PanelContract<ImagePanelProps, ImagePanelJSONProps> {
  private __props?: Omit<ImagePanelProps, "src">;
  private __serverProps?: ImagePanelJSONProps;

  getType() {
    return "image";
  }
  getClientProps(
    props: ImagePanelProps
  ): Omit<PanelContract<ImagePanelProps, { src: string } | null>, "getClientProps"> {
    this.__props = props;
    return this;
  }
  getServerProps(json: string | null): Omit<PanelContract<ImagePanelProps, { src: string } | null>, "fromJSON"> {
    if (!json) return this;
    try {
      this.__serverProps = ImagePanelJSONSchema.parse(JSON.parse(json));
    } catch (error) {
      console.error("could not parse textbox schema");
    }

    return this;
  }
  render(): ReactElement<unknown, string | JSXElementConstructor<any>> | null {
    if (!this.__props || !this.__serverProps) return null;

    return <Image {...this.__props} {...this.__serverProps} />;
  }
}
