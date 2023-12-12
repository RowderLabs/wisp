import { ImageUploadOverlay, ImageUploader, ImageUploaderProps } from "./ImageUploader";
import TextEditor from "./TextEditor";
const panels = {
  image: {
    renderContent: (args: ImageUploaderProps) => (
      <ImageUploader {...args}>
        {({ wrapperStyle, ...props }) => (
          <div style={wrapperStyle} className="bg-slate-300 resize overflow-auto">
            <ImageUploadOverlay imageOpts={props.opts?.image} {...props} />
          </div>
        )}
      </ImageUploader>
    ),
  },
  textbox: {
    renderContent: () => <TextEditor className="bg-white border p-4 rounded-md"/>,
  },
};
type PanelKey = keyof typeof panels;
type PanelDefinition<TData> = {
  [key in PanelKey]: {
    renderContent: (args: Parameters<typeof panels[key]["renderContent"]>[0]) => JSX.Element; // You can specify a more specific type if needed
  };
};

export const createPanel = <TData, TKey extends PanelKey>(
  pType: TKey,
  opts?: Parameters<PanelDefinition<TData>[TKey]["renderContent"]>[0]
) => {
  const content = panels[pType].renderContent as PanelDefinition<TData>[TKey]["renderContent"];
  return { size: "md", content: content({ ...opts }) };
};
