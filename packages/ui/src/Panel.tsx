export type PanelProps = {
  id: number;
  content: JSX.Element;
  size?: "sm" | "md" | "lg";
};


export function Panel({ content, id }: PanelProps) {
  return <>{content}</>;
}
