import React, { useEffect } from "react";

export function useClickExact<T extends HTMLElement>(ref: React.Ref<T>, onClick: () => void) {
  if (!ref) return;

  const handleClick = (e: MouseEvent) => {
    if (typeof ref !== 'function' && e.target === ref.current) onClick()
  }
  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [ref]);

  return null;
}
