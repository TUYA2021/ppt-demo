import { mockSlides } from "@/lib/ppt/mockData";

export async function POST() {
  return Response.json({
    slides: mockSlides,
  });
}
