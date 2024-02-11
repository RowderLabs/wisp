import { VariantProps, cva } from "class-variance-authority";
import { useDialogManager } from "./hooks";
import { Dialog } from "./Dialog";
import React from "react";
import { HiExclamationTriangle } from "react-icons/hi2";

export const imageVariants = cva("w-full h-full block rounded-md", {
  variants: {
    fit: { cover: "object-cover", contain: "object-contain" },
  },
  defaultVariants: {
    fit: "cover",
  },
});

export type ImageProps = {
  src: string;
} & VariantProps<typeof imageVariants>;
export const Image = ({ src, fit }: ImageProps) => {
  const [showFallback, setShowFallback] = React.useState(false);
  return (
    <>
      {showFallback ? (
        <img
          src={src}
          onError={(e) => setShowFallback(true)}
          className={imageVariants({ fit })}
        />
      ) : (
        <ImageErrorFallback/>
      )}
    </>
  );
};

function ImageErrorFallback() {
  return (
    <div className="text-slate-500 text-lg border w-full h-full rounded-md flex justify-center items-center">
      <HiExclamationTriangle/>
    </div>
  )
}
