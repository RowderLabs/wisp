import { FC, FocusEventHandler, KeyboardEventHandler, PropsWithChildren, useEffect, useRef, useState } from "react";
import useDoubleClick from "use-double-click";

type EditableTextProps = {
  onSubmit: (text: string) => void;
  value: string;
};

export const EditableInline: FC<PropsWithChildren<EditableTextProps>> = ({ children, onSubmit, value = "" }) => {
  const [editing, setEditing] = useState(false);
  const textRef = useRef<HTMLInputElement | null>(null);

  useDoubleClick({
    onDoubleClick: () => setEditing(true),
    ref: textRef,
    latency: 250,
  });

  useEffect(() => {
    if (editing && textRef.current) {
      textRef.current.focus();
      textRef.current.size = textRef.current.value.length;
    }
  }, [editing]);

  const handleSubmit: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === "Enter" && textRef.current?.value) {
      setEditing(false);
      onSubmit(textRef.current.value);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    setEditing(false);
  };

  return (
    <>
      {editing ? (
        <input
          defaultValue={value}
          className="outline-none"
          ref={textRef}
          onBlur={handleBlur}
          onKeyDown={handleSubmit}
          onChange={(e) => (textRef.current!.size = e.target.value.length)}
          type="text"
        />
      ) : (
        <div ref={textRef}>{children}</div>
      )}
    </>
  );
};
