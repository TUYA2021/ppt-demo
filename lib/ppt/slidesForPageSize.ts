import type { PageSizeId, SlideData } from "./types";

function collectImages(slide: SlideData) {
  const images = slide.images ?? [];

  return slide.image ? [slide.image, ...images.filter((image) => image !== slide.image)] : images;
}

function mergeRenderSlides(first: SlideData, second: SlideData): SlideData {
  const firstImage = collectImages(first)[0];
  const secondImage = collectImages(second)[0];

  return {
    ...first,
    id: `${first.id}-${second.id}`,
    title: first.room ? `${first.room}效果图` : first.title,
    image: undefined,
    images: [firstImage, secondImage].filter(Boolean),
    room: first.room,
  };
}

function canMergeRenderSlides(first: SlideData, second: SlideData) {
  return (
    first.layout === "renderWide" &&
    second.layout === "renderWide" &&
    Boolean(first.room) &&
    first.room === second.room
  );
}

export function getSlidesForPageSize(slides: SlideData[], pageSizeId: PageSizeId) {
  if (pageSizeId !== "a3Portrait") {
    return slides;
  }

  const mergedSlides: SlideData[] = [];

  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index];

    if (slide.layout !== "renderWide") {
      mergedSlides.push(slide);
      continue;
    }

    const images = collectImages(slide);

    if (images.length >= 2) {
      mergedSlides.push({ ...slide, image: undefined, images });
      continue;
    }

    const nextSlide = slides[index + 1];

    if (nextSlide && canMergeRenderSlides(slide, nextSlide)) {
      mergedSlides.push(mergeRenderSlides(slide, nextSlide));
      index += 1;
      continue;
    }

    mergedSlides.push(slide);
  }

  return mergedSlides;
}
