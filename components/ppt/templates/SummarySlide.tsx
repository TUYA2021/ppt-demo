import type { SlideData } from "@/lib/ppt/types";

export function SummarySlide({ slide }: { slide: SlideData }) {
  return (
    <section className="flex h-full flex-col justify-center bg-[#111827] p-12 text-white">
      <p className="text-sm font-semibold text-[#93c5fd]">Material And Lighting</p>
      <h2 className="mt-3 max-w-3xl text-5xl font-semibold leading-tight">{slide.title}</h2>
      {slide.subtitle ? <p className="mt-6 max-w-3xl text-lg leading-8 text-[#d1d5db]">{slide.subtitle}</p> : null}
      <div className="mt-10 grid grid-cols-3 gap-4">
        {slide.points?.map((point) => (
          <div key={point} className="border border-[#374151] p-5">
            <p className="font-medium">{point}</p>
          </div>
        ))}
      </div>
      {slide.note ? <p className="mt-8 text-sm text-[#9ca3af]">{slide.note}</p> : null}
    </section>
  );
}
