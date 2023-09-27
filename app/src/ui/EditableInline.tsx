import { FC, FocusEventHandler, KeyboardEventHandler, PropsWithChildren, useEffect, useRef, useState } from "react";
import useDoubleClick from "use-double-click";
import { mergeRefs } from "react-merge-refs";
import { useClickOutside } from "../hooks/useClickOutside";

type EditableTextProps = {
  onSubmit: (text: string) => void;
  value: string;
};

export const EditableInline: FC<PropsWithChildren<EditableTextProps>> = ({
  children,
  onSubmit,
  value = "",
}) => {
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
    }
  }, [editing]);

  const handleSubmit: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === "Enter" && textRef.current?.value) {
      setEditing(false);
      onSubmit(textRef.current.value);
    }
  };

  const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    setEditing(false)
  }

  return (
    <>
      {editing ? (
        <input
          defaultValue={value}
          className="outline-none"
          ref={textRef}
          onBlur={handleBlur}
          onKeyDown={handleSubmit}
          type="text"
        />
      ) : (
          <div ref={textRef}>{children}</div>
      )}
    </>
  );
};
