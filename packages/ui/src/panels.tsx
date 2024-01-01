import { ImageUploadOverlay, ImageUploader, ImageUploaderProps } from "./ImageUploader";
import { Resizable } from "./Resizable";
import { TextBox, TextBoxProps } from "./Textbox";
const panels = {
  image: {
    renderContent: (args: ImageUploaderProps) => (
      <Resizable restrictToX={true} minWidth={200} minHeight={200}>
        <ImageUploader {...args}>
          {({ wrapperStyle, ...props }) => (
            <div style={wrapperStyle} className="bg-slate-200 h-full">
              <ImageUploadOverlay imageOpts={props.opts?.image} {...props} />
            </div>
          )}
        </ImageUploader>
      </Resizable>
    ),
  },
  textbox: {
    renderContent: (args: TextBoxProps) => (
      <Resizable minHeight={200} minWidth={200}>
        <TextBox {...args} />
      </Resizable>
    ),
  },
};
type PanelKey = keyof typeof panels;
type PanelDefinition = {
  [key in PanelKey]: {
    renderContent: (args: Parameters<typeof panels[key]["renderContent"]>[0]) => JSX.Element; // You can specify a more specific type if needed
  };
};

//UTILITY TO GET REQUIRED FIELDS
type RequiredFieldKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type RequiredFields<T> = Pick<T, RequiredFieldKeys<T>>;
type RenderProps<TKey extends keyof PanelDefinition> = Parameters<PanelDefinition[TKey]["renderContent"]>[0];

export const createPanel = <TKey extends PanelKey>(pType: TKey, reqProps: RenderProps<TKey>) => {
  const content = panels[pType].renderContent as PanelDefinition[TKey]["renderContent"];
  return { content: content({ ...reqProps }) };
};
