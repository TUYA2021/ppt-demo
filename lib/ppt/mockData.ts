import type { SlideData } from "./types";

export const mockSlides: SlideData[] = [
  {
    id: "cover",
    layout: "cover",
    title: "120㎡现代风三居室设计方案",
    subtitle: "室内方案汇报",
    image: "/demo/living-room.jpg",
    points: ["平面优化", "效果图展示", "材料与灯光建议"],
  },
  {
    id: "plan",
    layout: "planSquare",
    title: "平面布置图",
    subtitle: "Square floor plan",
    image: "/demo/living-room.jpg",
    points: ["客餐厅保持开阔动线", "玄关增加通顶收纳", "主卧预留独立梳妆区"],
  },
  {
    id: "living-render",
    layout: "renderWide",
    title: "客厅效果图",
    subtitle: "明亮、开放、舒适的家庭核心空间",
    image: "/demo/living-room.jpg",
  },
  {
    id: "bedroom-render",
    layout: "renderWide",
    title: "卧室效果图",
    subtitle: "低饱和配色与柔和灯光，突出休息氛围",
    image: "/demo/living-room.jpg",
  },
  {
    id: "material",
    layout: "imageText",
    title: "材料与灯光建议",
    subtitle: "浅木色、暖白墙面、无主灯照明",
    image: "/demo/living-room.jpg",
    points: ["浅色木饰面作为主视觉", "微水泥或浅灰地面控制整体干净度", "局部灯带增强层次"],
  },
  {
    id: "summary",
    layout: "summary",
    title: "方案总结",
    subtitle: "用更简单的结构，先把图和少量说明稳定放进 PPT。",
    points: ["平面图按正方形版式呈现", "效果图按 16:9 大图呈现", "模板风格通过配置文件调整"],
  },
];
