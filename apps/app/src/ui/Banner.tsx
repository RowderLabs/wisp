import clsx from "clsx";
import React, { PropsWithChildren } from "react";

type BannerProps = {
  className?: string;
  style?: React.CSSProperties;
};

export const Banner: React.FC<PropsWithChildren<BannerProps>> = ({ children, className, style }) => {
  return (
    <div
      style={style}
      className={clsx("bg-slate-200 min-h-[200px] flex flex-col gap-4 p-6", className)}
    >
      {children}
    </div>
  );
};
