import Image from "next/image";
import type { ReactNode } from "react";
import { getSlideLayoutPreset, type ImageLayoutBox, type LayoutBox, type TextLayoutBox } from "@/lib/ppt/layoutPresets";
import { getPageSizePreset } from "@/lib/ppt/templates";
import type { PageSizeId, SlideData, TemplatePreset } from "@/lib/ppt/types";

function slideImages(slide: SlideData) {
  const images = slide.images ?? [];

  return slide.image ? [slide.image, ...images.filter((image) => image !== slide.image)] : images;
}

function toPercentBox(box: LayoutBox, pageSizeId: PageSizeId) {
  const pageSize = getPageSizePreset(pageSizeId);

  return {
    left: `${(box.x / pageSize.width) * 100}%`,
    top: `${(box.y / pageSize.height) * 100}%`,
    width: `${(box.w / pageSize.width) * 100}%`,
    height: `${(box.h / pageSize.height) * 100}%`,
  };
}

function ImageFrame({
  slide,
  box,
  pageSizeId,
  preset,
  image,
}: {
  slide: SlideData;
  box: ImageLayoutBox;
  pageSizeId: PageSizeId;
  preset: TemplatePreset;
  image?: string;
}) {
  return (
    <div
      className="absolute overflow-hidden"
      style={{
        ...toPercentBox(box, pageSizeId),
        background: preset.colors.imageBg,
      }}
    >
      {image ? (
        <Image
          src={image}
          alt={slide.title}
          fill
          className={box.fit === "contain" ? "object-contain" : "object-cover"}
        />
      ) : (
        <div className="grid h-full place-items-center border border-dashed text-sm">
          等待图片
        </div>
      )}
    </div>
  );
}

function TextBox({
  children,
  box,
  pageSizeId,
  color,
  weight = 600,
}: {
  children: ReactNode;
  box: TextLayoutBox;
  pageSizeId: PageSizeId;
  color: string;
  weight?: number;
}) {
  return (
    <div
      className="absolute overflow-hidden leading-tight"
      style={{
        ...toPercentBox(box, pageSizeId),
        color,
        fontSize: box.fontSize,
        fontWeight: weight,
        textAlign: box.align ?? "left",
      }}
    >
      {children}
    </div>
  );
}

function Footer({
  index,
  total,
  preset,
}: {
  index: number;
  total: number;
  preset: TemplatePreset;
}) {
  if (!preset.showPageNumber) {
    return null;
  }

  return (
    <div
      className="absolute bottom-6 right-7 text-xs"
      style={{ color: preset.colors.muted }}
    >
      {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </div>
  );
}

export function TemplatePreview({
  slide,
  preset,
  index,
  total,
  pageSizeId = "wide16x9",
}: {
  slide: SlideData;
  preset: TemplatePreset;
  index: number;
  total: number;
  pageSizeId?: PageSizeId;
}) {
  const layout = getSlideLayoutPreset(pageSizeId, slide.layout);
  const images = slideImages(slide);
  const imageSlots = layout.imageSlots ?? (layout.image ? [layout.image] : []);

  return (
    <div className="relative h-full w-full" style={{ background: preset.colors.background }}>
      {imageSlots.map((box, imageIndex) => (
        <ImageFrame
          key={`${box.x}-${box.y}-${imageIndex}`}
          slide={slide}
          box={box}
          pageSizeId={pageSizeId}
          preset={preset}
          image={images[imageIndex]}
        />
      ))}

      <TextBox box={layout.title} pageSizeId={pageSizeId} color={preset.colors.text}>
        {slide.title}
      </TextBox>

      {slide.layout === "cover" && slide.subtitle && layout.subtitle ? (
        <TextBox
          box={layout.subtitle}
          pageSizeId={pageSizeId}
          color={preset.colors.muted}
          weight={400}
        >
          {slide.subtitle}
        </TextBox>
      ) : null}

      <Footer index={index} total={total} preset={preset} />
    </div>
  );
}
