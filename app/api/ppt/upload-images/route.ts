import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const uploadDir = path.join(process.cwd(), "public", "uploads", "ppt");
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function safeFileName(name: string) {
  const ext = path.extname(name).toLocaleLowerCase();
  const base = path
    .basename(name, ext)
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return `${base || "image"}-${Date.now()}${ext || ".jpg"}`;
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("images").filter((item): item is File => item instanceof File);

  await mkdir(uploadDir, { recursive: true });

  const uploaded = await Promise.all(
    files.map(async (file) => {
      if (!allowedTypes.has(file.type)) {
        throw new Error(`Unsupported image type: ${file.type}`);
      }

      const fileName = safeFileName(file.name);
      const buffer = Buffer.from(await file.arrayBuffer());

      await writeFile(path.join(uploadDir, fileName), buffer);

      return {
        name: file.name,
        url: `/uploads/ppt/${fileName}`,
      };
    }),
  );

  return Response.json({ images: uploaded });
}
