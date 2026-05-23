export type SlideLayout = "cover" | "planSquare" | "renderWide" | "imageText" | "summary";

export type TemplateId = "warmMinimal" | "galleryWhite" | "darkStudio";

export type PageSizeId = "wide16x9" | "a3Landscape" | "a3Portrait";

export type ProjectImageCategory = "cover" | "plan" | "render" | "material" | "other";

export type ProjectImageAsset = {
  id: string;
  name: string;
  url: string;
  category: ProjectImageCategory;
  room?: string;
  roomName?: string;
  cam?: number;
  source?: "system" | "upload" | "manual";
  sort?: number;
};

export type ProjectPptPayload = {
  project: {
    title: string;
    intro: string;
    concept?: string;
    coverImage?: string;
  };
  images: ProjectImageAsset[];
};

export type SlideData = {
  id: string;
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  image?: string;
  points?: string[];
  note?: string;
  room?: string;
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
