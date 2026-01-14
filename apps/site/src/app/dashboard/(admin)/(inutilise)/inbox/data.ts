import small1 from "@/assets/dashboard/images/small/img-1.jpg";
import small2 from "@/assets/dashboard/images/small/img-2.jpg";
import small3 from "@/assets/dashboard/images/small/img-3.jpg";
import small4 from "@/assets/dashboard/images/small/img-4.jpg";
import { StaticImageData } from "next/image";

export type EmailBodyImage = {
  image: StaticImageData;
};

export type EmailBodyFile = {
  icon: string;
  title: string;
  variant: string;
};

export const emailBodyImageData: EmailBodyImage[] = [
  {
    image: small1,
  },
  {
    image: small2,
  },
  {
    image: small3,
  },
  {
    image: small4,
  },
];

export const emailBodyFileData: EmailBodyFile[] = [
  {
    icon: "solar:file-download-bold",
    title: "Project About..",
    variant: "primary",
  },
  {
    icon: "solar:figma-file-bold",
    title: "Photo Psd...",
    variant: "success",
  },
  {
    icon: "solar:checklist-minimalistic-bold",
    title: "Price List...",
    variant: "danger",
  },
];
