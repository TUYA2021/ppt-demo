import Image from "next/image";
import type { SlideData, TemplatePreset } from "@/lib/ppt/types";

function slideImage(slide: SlideData) {
  return slide.image ?? slide.images?.[0];
}

function ImageFrame({
  slide,
  className,
  fit = "cover",
}: {
  slide: SlideData;
  className: string;
  fit?: "cover" | "contain";
}) {
  const image = slideImage(slide);

  if (!image) {
    return (
      <div className={`grid place-items-center border border-dashed text-sm ${className}`}>
        等待图片
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={image}
        alt={slide.title}
        fill
        className={fit === "contain" ? "object-contain" : "object-cover"}
      />
    </div>
  );
}

function Points({ points, color }: { points?: string[]; color: string }) {
  if (!points?.length) {
    return null;
  }

  return (
    <ul className="grid gap-2 text-base leading-7" style={{ color }}>
      {points.map((point) => (
        <li key={point} className="flex gap-2">
          <span>•</span>
          <span>{point}</span>
        </li>
      ))}
    </ul>
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

function CoverSlide({
  slide,
  preset,
  index,
  total,
}: {
  slide: SlideData;
  preset: TemplatePreset;
  index: number;
  total: number;
}) {
  return (
    <div className="relative grid h-full grid-cols-[0.95fr_1.05fr]" style={{ background: preset.colors.background }}>
      <div className="flex flex-col justify-between p-12">
        <div>
          <p className="text-xs font-semibold uppercase" style={{ color: preset.colors.accent }}>
            Interior Presentation
          </p>
          <h1 className="mt-8 text-5xl font-semibold leading-tight" style={{ color: preset.colors.text }}>
            {slide.title}
          </h1>
          {slide.subtitle ? (
            <p className="mt-5 text-xl leading-8" style={{ color: preset.colors.muted }}>
              {slide.subtitle}
            </p>
          ) : null}
        </div>
        <Points points={slide.points} color={preset.colors.text} />
      </div>
      <div className="p-8">
        <ImageFrame
          slide={slide}
          className="h-full w-full"
          fit="cover"
        />
      </div>
      <Footer index={index} total={total} preset={preset} />
    </div>
  );
}

function PlanSquareSlide({
  slide,
  preset,
  index,
  total,
}: {
  slide: SlideData;
  preset: TemplatePreset;
  index: number;
  total: number;
}) {
  return (
    <div className="relative grid h-full grid-cols-[1fr_0.72fr]" style={{ background: preset.colors.background }}>
      <div className="grid place-items-center p-10">
        <div className="aspect-square w-[82%]" style={{ background: preset.colors.imageBg }}>
          <ImageFrame slide={slide} className="h-full w-full" fit="contain" />
        </div>
      </div>
      <div className="flex flex-col justify-center p-10">
        <p className="text-xs font-semibold uppercase" style={{ color: preset.colors.accent }}>
          Floor Plan
        </p>
        <h2 className="mt-5 text-4xl font-semibold leading-tight" style={{ color: preset.colors.text }}>
          {slide.title}
        </h2>
        {slide.subtitle ? (
          <p className="mt-3 text-lg" style={{ color: preset.colors.muted }}>
            {slide.subtitle}
          </p>
        ) : null}
        <div className="mt-8">
          <Points points={slide.points} color={preset.colors.text} />
        </div>
      </div>
      <Footer index={index} total={total} preset={preset} />
    </div>
  );
}

function RenderWideSlide({
  slide,
  preset,
  index,
  total,
}: {
  slide: SlideData;
  preset: TemplatePreset;
  index: number;
  total: number;
}) {
  return (
    <div className="relative h-full" style={{ background: preset.colors.background }}>
      <div className="absolute inset-x-8 top-8 bottom-28" style={{ background: preset.colors.imageBg }}>
        <ImageFrame slide={slide} className="h-full w-full" fit="cover" />
      </div>
      <div className="absolute inset-x-8 bottom-8 grid grid-cols-[1fr_auto] items-end gap-6">
        <div>
          <h2 className="text-3xl font-semibold" style={{ color: preset.colors.text }}>
            {slide.title}
          </h2>
          {slide.subtitle ? (
            <p className="mt-2 text-base" style={{ color: preset.colors.muted }}>
              {slide.subtitle}
            </p>
          ) : null}
        </div>
      </div>
      <Footer index={index} total={total} preset={preset} />
    </div>
  );
}

function ImageTextSlide({
  slide,
  preset,
  index,
  total,
}: {
  slide: SlideData;
  preset: TemplatePreset;
  index: number;
  total: number;
}) {
  return (
    <div className="relative grid h-full grid-cols-[0.95fr_1.05fr]" style={{ background: preset.colors.background }}>
      <div className="flex flex-col justify-center p-11">
        <p className="text-xs font-semibold uppercase" style={{ color: preset.colors.accent }}>
          Materials
        </p>
        <h2 className="mt-5 text-4xl font-semibold leading-tight" style={{ color: preset.colors.text }}>
          {slide.title}
        </h2>
        {slide.subtitle ? (
          <p className="mt-4 text-lg leading-8" style={{ color: preset.colors.muted }}>
            {slide.subtitle}
          </p>
        ) : null}
        <div className="mt-8">
          <Points points={slide.points} color={preset.colors.text} />
        </div>
      </div>
      <div className="p-8">
        <ImageFrame slide={slide} className="h-full w-full" fit="cover" />
      </div>
      <Footer index={index} total={total} preset={preset} />
    </div>
  );
}

function SummarySlide({
  slide,
  preset,
  index,
  total,
}: {
  slide: SlideData;
  preset: TemplatePreset;
  index: number;
  total: number;
}) {
  return (
    <div className="relative flex h-full flex-col justify-center p-16" style={{ background: preset.colors.background }}>
      <p className="text-xs font-semibold uppercase" style={{ color: preset.colors.accent }}>
        Summary
      </p>
      <h2 className="mt-5 max-w-4xl text-5xl font-semibold leading-tight" style={{ color: preset.colors.text }}>
        {slide.title}
      </h2>
      {slide.subtitle ? (
        <p className="mt-5 max-w-3xl text-xl leading-8" style={{ color: preset.colors.muted }}>
          {slide.subtitle}
        </p>
      ) : null}
      <div className="mt-10 max-w-3xl">
        <Points points={slide.points} color={preset.colors.text} />
      </div>
      <Footer index={index} total={total} preset={preset} />
    </div>
  );
}

export function TemplatePreview({
  slide,
  preset,
  index,
  total,
}: {
  slide: SlideData;
  preset: TemplatePreset;
  index: number;
  total: number;
}) {
  if (slide.layout === "cover") {
    return <CoverSlide slide={slide} preset={preset} index={index} total={total} />;
  }

  if (slide.layout === "planSquare") {
    return <PlanSquareSlide slide={slide} preset={preset} index={index} total={total} />;
  }

  if (slide.layout === "renderWide") {
    return <RenderWideSlide slide={slide} preset={preset} index={index} total={total} />;
  }

  if (slide.layout === "summary") {
    return <SummarySlide slide={slide} preset={preset} index={index} total={total} />;
  }

  return <ImageTextSlide slide={slide} preset={preset} index={index} total={total} />;
}
