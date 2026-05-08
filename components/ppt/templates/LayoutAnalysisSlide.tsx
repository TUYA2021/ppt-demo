import type { SlideData } from "@/lib/ppt/types";

export function LayoutAnalysisSlide({ slide }: { slide: SlideData }) {
  return (
    <section className="grid h-full grid-cols-[0.9fr_1.1fr] bg-[#10201d] text-white">
      <div className="flex flex-col justify-between p-10">
        <p className="text-sm font-semibold text-[#9fd3c7]">Layout Analysis</p>
        <div>
          <h2 className="text-4xl font-semibold leading-tight">{slide.title}</h2>
          {slide.subtitle ? <p className="mt-4 text-lg leading-8 text-[#d8e4df]">{slide.subtitle}</p> : null}
        </div>
        {slide.note ? <p className="text-sm leading-6 text-[#cbd5d1]">{slide.note}</p> : null}
      </div>
      <div className="grid content-center gap-3 bg-[#f6f6f0] p-10 text-[#17211f]">
        {slide.points?.map((point, index) => (
          <div key={point} className="flex items-center gap-4 border-b border-[#d8ded9] py-5">
            <span className="text-2xl font-semibold text-[#3b6f6a]">0{index + 1}</span>
            <p className="text-lg font-medium">{point}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
