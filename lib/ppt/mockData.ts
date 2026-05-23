import { buildSlidesFromProjectPayload } from "./buildSlides";
import type { ProjectPptPayload } from "./types";

export const mockProjectPayload: ProjectPptPayload = {
  project: {
    title: "120㎡现代风三居室设计方案",
    intro: "本案围绕通透、温暖、简洁的生活方式展开，重点优化公共区尺度、收纳与自然采光。",
    concept: "设计概念：通透、温暖、简洁的现代家庭空间",
  },
  images: [],
};

export const mockSlides = buildSlidesFromProjectPayload(mockProjectPayload);
