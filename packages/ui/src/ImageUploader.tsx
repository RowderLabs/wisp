import { HiPhoto } from "react-icons/hi2";
import { cva, type VariantProps } from "class-variance-authority";
import { useUploadableImage } from "./hooks/useUploadableImage";
import { Image, imageVariants } from "./Image";
import React, { PropsWithChildren } from "react";

const imageUploaderVariants = cva(
  "opacity-0 hover:opacity-100 transition-opacity duration-150 ease w-full h-full rounded-md flex justify-center border-2 border-slate-500 border-dashed items-center cursor-pointer"
);

export type ImageUploaderProps = {
  onUpload?: () => void;
  opts?: { image?: VariantProps<typeof imageVariants> };
} & VariantProps<typeof imageUploaderVariants>;

export function ImageUploader({
  opts,
  onUpload,
  children,
}: ImageUploaderProps & {
  children: (
    props: Omit<ImageUploaderProps, "children" | "onUpload"> & {
      wrapperStyles: string;
    } & Omit<UploaderProps, "imageOpts">
  ) => React.ReactNode;
}) {
  const { image: src, uploadImage: handleUpload } = useUploadableImage({ onUpload });
  const wrapperStyles = "relative";

  return (
    <>
      {children({
        src,
        opts,
        wrapperStyles,
        handleUpload,
      })}
    </>
  );
}

type UploaderProps = {
  src: string | null;
  imageOpts?: VariantProps<typeof imageVariants>;
  handleUpload: () => Promise<void>;
};

export const ImageUploadOverlay = ({ src, handleUpload, imageOpts }: UploaderProps) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full text-slate-600">
      {src ? (
        <Image {...imageOpts} src={src} />
      ) : (
        <div onClick={handleUpload} className={imageUploaderVariants()}>
          <div className="flex flex-col items-center gap-2">
            <span className="text-[32px]">
              <HiPhoto />
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
