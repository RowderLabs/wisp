import { z } from "zod";
import { Panel } from "./base";
import { Image, ImageProps } from "../src/Image";

const ImagePanelJSONSchema = z
  .object({
    src: z.string(),
  })
  .nullable();

type ImagePanelJSONProps = z.infer<typeof ImagePanelJSONSchema>
type ImagePanelProps = Omit<ImageProps, 'src'>

export class ImagePanel extends Panel<ImagePanelProps, ImagePanelJSONProps> {
  constructor(props: ImagePanelProps) {
    super(props);
  }

  renderFromJSON(json: string | null): React.ReactElement<ImageProps> | React.ReactElement | null {
    
    const jsonProps = this.__parseJSONProps(json, ImagePanelJSONSchema);
    return jsonProps ? (
      //if exists pass initial
      <Image {...jsonProps} {...this.__props} />
    ) : (
      //else create textbox
      <div className="h-[300px] h-[300px] bg-slate-300"></div>
    );
  }
}