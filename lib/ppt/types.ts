export type SlideLayout = "cover" | "planSquare" | "renderWide" | "imageText" | "summary";

export type TemplateId = "warmMinimal" | "galleryWhite" | "darkStudio";

export type PageSizeId = "wide16x9" | "a3Landscape" | "a3Portrait";

export type SlideData = {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  image?: string;
  points?: string[];
  note?: string;
  // Compatibility for earlier API/template experiments.
  type?: SlideLayout;
  images?: string[];
};

export type TemplatePreset = {
  id: TemplateId;
  name: string;
  description: string;
  colors: {
    background: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    imageBg: string;
  };
  font: {
    title: string;
    body: string;
  };
  showPageNumber: boolean;
};

export type PageSizePreset = {
  id: PageSizeId;
  name: string;
  description: string;
  width: number;
  height: number;
};
