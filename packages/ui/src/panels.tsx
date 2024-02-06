import { TextBox } from "./Textbox";

const registeredPanels = {
  textbox: {
    component: TextBox,
    derivedProps: "initial",
  },
} as const;

type PanelKey = keyof typeof registeredPanels;
type RequiredKeys<T> = { [K in keyof T]-?: {} extends Pick<T, K> ? never : K }[keyof T];

type PanelDefinition<T extends typeof registeredPanels = typeof registeredPanels> = {
  [key in PanelKey]: {
    props: Omit<React.ComponentPropsWithoutRef<T[key]["component"]>, T[key]["derivedProps"]>;
    fromJSON: (json: string | null) => Pick<React.ComponentPropsWithoutRef<T[key]['component']>, T[key]['derivedProps']>
  };
};
type T1 = Pick<React.ComponentPropsWithoutRef<typeof TextBox>, 'initial'>

export function createPanel(
  key: PanelKey,
  content: string | null,
  props: PanelDefinition[typeof key]["props"],
  fromJSON: PanelDefinition[typeof key]["fromJSON"]
): React.ReactNode {
  const Component = registeredPanels[key]["component"];
  const jsonProps = fromJSON(content)
  const allProps = { ...props, ...jsonProps};
  return <Component {...allProps} />;
}
