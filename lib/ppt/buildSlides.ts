import type {
  ProjectImageAsset,
  ProjectImageCategory,
  ProjectPptPayload,
  SlideData,
} from "./types";

const roomKeywords = [
  "客厅",
  "餐厅",
  "主卧",
  "卧室",
  "厨房",
  "卫生间",
  "阳台",
  "玄关",
  "书房",
  "儿童房",
  "衣帽间",
];

const categoryRules: Array<{ category: ProjectImageCategory; keywords: string[] }> = [
  { category: "cover", keywords: ["封面", "首页", "cover"] },
  { category: "plan", keywords: ["平面", "户型", "布局", "plan", "layout", "floor"] },
  {
    category: "render",
    keywords: [
      "效果",
      "渲染",
      "render",
      "客厅",
      "餐厅",
      "卧室",
      "厨房",
      "卫生间",
      "阳台",
      "玄关",
      "书房",
    ],
  },
  { category: "material", keywords: ["材料", "材质", "物料", "material", "finish"] },
];

type ImportedImageAsset = Partial<ProjectImageAsset> & {
  imageUrl?: string;
  src?: string;
  roomName?: string;
  room_name?: string;
  RoomName?: string;
  camera?: number | string;
  camIndex?: number | string;
};

function cleanName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .replace(/[_-]+/g, " ")
    .trim();
}

function includesKeyword(source: string, keyword: string) {
  return source.toLocaleLowerCase().includes(keyword.toLocaleLowerCase());
}

export function inferImageCategory(name: string): ProjectImageCategory {
  for (const rule of categoryRules) {
    if (rule.keywords.some((keyword) => includesKeyword(name, keyword))) {
      return rule.category;
    }
  }

  return "render";
}

export function inferImageRoom(name: string) {
  return roomKeywords.find((keyword) => includesKeyword(name, keyword));
}

export function inferImageCam(name: string) {
  const match = name.match(/(?:^|[-_\s])(?:cam|camera|视角|机位)\s*([0-3])(?:$|[-_\s])/i);

  return match ? Number(match[1]) : undefined;
}

export function createProjectImageAsset(
  file: { name: string; url: string },
  index: number,
): ProjectImageAsset {
  const name = cleanName(file.name);

  return {
    id: `${Date.now()}-${index}-${name}`,
    name,
    url: file.url,
    category: inferImageCategory(name),
    room: inferImageRoom(name),
    cam: inferImageCam(name),
    source: "upload",
    sort: index,
  };
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.trim());

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function normalizeImageAsset(image: ImportedImageAsset, index: number): ProjectImageAsset {
  const url = image.url ?? image.imageUrl ?? image.src ?? "";
  const name = image.name ?? cleanName(url.split("/").pop() ?? `image-${index + 1}`);
  const room = image.room ?? image.roomName ?? image.room_name ?? image.RoomName ?? inferImageRoom(name);
  const cam = toNumber(image.cam ?? image.camera ?? image.camIndex) ?? inferImageCam(name);

  return {
    id: image.id ?? `${Date.now()}-${index}-${name}`,
    name,
    url,
    category: image.category ?? inferImageCategory(name),
    room,
    roomName: image.roomName ?? room,
    cam,
    source: image.source ?? (url.startsWith("http") ? "system" : "manual"),
    sort: image.sort ?? index,
  };
}

function sortImages(images: ProjectImageAsset[]) {
  return images
    .map((image, index) => normalizeImageAsset(image, index))
    .sort((a, b) => {
      const sortDiff = (a.sort ?? 0) - (b.sort ?? 0);

      if (sortDiff !== 0) {
        return sortDiff;
      }

      return (a.cam ?? 0) - (b.cam ?? 0);
    });
}

function roomKey(image: ProjectImageAsset) {
  return image.roomName?.trim() || image.room?.trim() || image.name || "未分类空间";
}

function groupImagesByRoom(images: ProjectImageAsset[]) {
  const groups = new Map<string, ProjectImageAsset[]>();

  images.forEach((image) => {
    const key = roomKey(image);
    const group = groups.get(key) ?? [];

    group.push(image);
    groups.set(key, group);
  });

  return [...groups.values()].flat();
}

function slideTitle(image: ProjectImageAsset, fallback: string) {
  return image.room ? `${image.room}${fallback}` : image.name || fallback;
}

export function buildSlidesFromProjectPayload(payload: ProjectPptPayload): SlideData[] {
  const images = sortImages(payload.images);
  const coverImage =
    payload.project.coverImage ??
    images.find((image) => image.category === "cover")?.url ??
    images.find((image) => image.category === "render")?.url ??
    images[0]?.url;
  const planImages = images.filter((image) => image.category === "plan");
  const renderImages = groupImagesByRoom(
    images.filter((image) => image.category === "render"),
  );
  const materialImages = images.filter((image) => image.category === "material");
  const otherImages = images.filter((image) => image.category === "other");

  const slides: SlideData[] = [
    {
      id: "cover",
      layout: "cover",
      title: payload.project.title || "室内设计方案",
      subtitle: payload.project.concept || payload.project.intro,
      image: coverImage,
    },
  ];

  planImages.forEach((image, index) => {
    slides.push({
      id: `plan-${image.id || index}`,
      layout: "planSquare",
      title: slideTitle(image, "平面布置图"),
      image: image.url,
    });
  });

  renderImages.forEach((image, index) => {
    const camText = typeof image.cam === "number" ? ` cam ${image.cam}` : "";

    slides.push({
      id: `render-${image.id || index}`,
      layout: "renderWide",
      title: `${slideTitle(image, "效果图")}${camText}`,
      image: image.url,
      room: roomKey(image),
    });
  });

  [...materialImages, ...otherImages].forEach((image, index) => {
    slides.push({
      id: `image-${image.id || index}`,
      layout: "imageText",
      title: image.name || "补充图片",
      image: image.url,
    });
  });

  return slides;
}
