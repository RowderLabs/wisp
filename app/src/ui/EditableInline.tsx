import { FC, KeyboardEventHandler, PropsWithChildren, useEffect, useRef, useState } from "react";
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
  const clickAwayRef = useClickOutside(() => setEditing(false));

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

  return (
    <>
      {editing ? (
        <input
          defaultValue={value}
          className="outline-none"
          ref={mergeRefs([clickAwayRef, textRef])}
          onKeyDown={handleSubmit}
          type="text"
        />
      ) : (
          <div ref={textRef}>{children}</div>
      )}
    </>
  );
};
