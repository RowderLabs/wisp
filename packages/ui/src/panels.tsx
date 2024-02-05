import { ImageUploadOverlay, ImageUploader, ImageUploaderProps } from "./ImageUploader";
import { TextBox, TextBoxProps } from "./Textbox";

const registeredPanels = {
  textbox: TextBox,
} as const;

type PanelKey = keyof typeof registeredPanels;
type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

type T1 = RequiredKeys<React.ComponentProps<typeof registeredPanels["textbox"]>>;

type PanelDefinition<T extends typeof registeredPanels = typeof registeredPanels> = {
  [key in PanelKey]: React.ComponentProps<T[key]>;
};

export function createPanel(key: PanelKey, props: PanelDefinition[typeof key]): React.ReactNode {
  const Component = registeredPanels[key];
  return <Component {...props} />;
}

