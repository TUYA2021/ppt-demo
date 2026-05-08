import Image from "next/image";
import type { SlideData } from "@/lib/ppt/types";

export function MaterialSlide({ slide }: { slide: SlideData }) {
  return (
    <section className="grid h-full grid-cols-[1fr_1.05fr] bg-[#fff7ed] text-[#1f2937]">
      <div className="p-10">
        <p className="text-sm font-semibold text-[#c2410c]">Render Showcase</p>
        <h2 className="mt-3 text-4xl font-semibold">{slide.title}</h2>
        {slide.subtitle ? <p className="mt-4 text-lg leading-8 text-[#57534e]">{slide.subtitle}</p> : null}
        <div className="mt-8 grid gap-4">
          {slide.points?.map((point) => (
            <div key={point} className="bg-white p-5 shadow-sm">
              <p className="text-lg font-semibold">{point}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="relative m-8 overflow-hidden bg-[#fed7aa]">
        {slide.images?.[0] ? <Image src={slide.images[0]} alt={slide.title} fill className="object-cover" /> : null}
      </div>
    </section>
  );
}
