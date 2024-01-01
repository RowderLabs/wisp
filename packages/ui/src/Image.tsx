import { VariantProps, cva } from "class-variance-authority";

export const imageVariants = cva("w-full h-auto block rounded-md", {
  variants: {
    fit: { cover: "object-cover", contain: "object-contain" },
  },
  defaultVariants: {
    fit: "contain",
  },
});

export type ImageProps = {
  src: string;
} & VariantProps<typeof imageVariants>;
export const Image = ({ src, fit }: ImageProps) => {
  return <img src={src} className={imageVariants({ fit })} />;
};
