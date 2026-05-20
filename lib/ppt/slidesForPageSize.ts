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
    title: `${first.title} / ${second.title}`,
    image: undefined,
    images: [firstImage, secondImage].filter(Boolean),
  };
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

    if (nextSlide?.layout === "renderWide") {
      mergedSlides.push(mergeRenderSlides(slide, nextSlide));
      index += 1;
      continue;
    }

    mergedSlides.push(slide);
  }

  return mergedSlides;
}
