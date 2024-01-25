export type PanelProps = {
  id: number;
  content: JSX.Element;
};


export function Panel({ content }: PanelProps) {
  return <>{content}</>;
}
