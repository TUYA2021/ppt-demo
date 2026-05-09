import type { SlideData } from "./types";

export const mockSlides: SlideData[] = [
  {
    id: "cover",
    layout: "cover",
    title: "120㎡现代风三居室设计方案",
    subtitle: "设计概念：通透、温暖、简洁的现代家庭空间",
    image: "/demo/living-room.jpg",
  },
  {
    id: "plan",
    layout: "planSquare",
    title: "平面布置图",
    image: "/demo/living-room.jpg",
  },
  {
    id: "living-render",
    layout: "renderWide",
    title: "客厅效果图",
    image: "/demo/living-room.jpg",
  },
  {
    id: "bedroom-render",
    layout: "renderWide",
    title: "卧室效果图",
    image: "/demo/living-room.jpg",
  },
];
