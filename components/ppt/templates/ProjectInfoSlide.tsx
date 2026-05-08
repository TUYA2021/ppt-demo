import type { SlideData } from "@/lib/ppt/types";

export function ProjectInfoSlide({ slide }: { slide: SlideData }) {
  return (
    <section className="flex h-full flex-col bg-white p-10 text-[#18181b]">
      <p className="text-sm font-semibold text-[#b45309]">Project Information</p>
      <h2 className="mt-3 text-4xl font-semibold">{slide.title}</h2>
      {slide.subtitle ? <p className="mt-2 text-lg text-[#71717a]">{slide.subtitle}</p> : null}
      <div className="mt-9 grid grid-cols-3 gap-4">
        {slide.points?.map((point) => (
          <div key={point} className="min-h-40 border border-[#e4e4e7] p-5">
            <p className="text-lg font-semibold leading-8">{point}</p>
          </div>
        ))}
      </div>
      {slide.note ? <p className="mt-auto text-sm leading-6 text-[#71717a]">{slide.note}</p> : null}
    </section>
  );
}
