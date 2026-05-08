import { readFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import type { SlideData } from "./types";

const imagePlaceholder = "{{image_1}}";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function publicImagePath(imagePath?: string) {
  if (!imagePath?.startsWith("/")) {
    return undefined;
  }

  return path.join(process.cwd(), "public", imagePath);
}

function getImageExtension(imagePath: string) {
  const ext = path.extname(imagePath).replace(".", "").toLowerCase();

  if (ext === "jpeg") {
    return "jpg";
  }

  if (ext === "png" || ext === "jpg") {
    return ext;
  }

  return "jpg";
}

function ensureImageContentType(contentTypesXml: string, extension: string) {
  const contentType = extension === "png" ? "image/png" : "image/jpeg";

  if (contentTypesXml.includes(`Extension="${extension}"`)) {
    return contentTypesXml;
  }

  return contentTypesXml.replace(
    "</Types>",
    `<Default Extension="${extension}" ContentType="${contentType}"/></Types>`,
  );
}

function nextRelationshipId(relsXml: string) {
  const ids = [...relsXml.matchAll(/Id="rId(\d+)"/g)].map((match) => Number(match[1]));
  const maxId = ids.length ? Math.max(...ids) : 0;

  return `rId${maxId + 1}`;
}

function addImageRelationship(relsXml: string | undefined, rId: string, target: string) {
  const relationship = `<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${target}"/>`;

  if (!relsXml) {
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${relationship}</Relationships>`;
  }

  return relsXml.replace("</Relationships>", `${relationship}</Relationships>`);
}

function pictureXml(shapeXml: string, rId: string) {
  const off = shapeXml.match(/<a:off x="([^"]+)" y="([^"]+)"/);
  const ext = shapeXml.match(/<a:ext cx="([^"]+)" cy="([^"]+)"/);
  const x = off?.[1] ?? "914400";
  const y = off?.[2] ?? "914400";
  const cx = ext?.[1] ?? "3657600";
  const cy = ext?.[2] ?? "2057400";

  return `<p:pic><p:nvPicPr><p:cNvPr id="9001" name="image_1"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="${x}" y="${y}"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>`;
}

function replaceTextPlaceholders(slideXml: string, slide: SlideData) {
  const replacements = {
    "{{title}}": slide.title,
    "{{subtitle}}": slide.subtitle ?? "",
    "{{points}}": slide.points?.map((point) => `• ${point}`).join("\n") ?? "",
    "{{note}}": slide.note ?? "",
  };

  return Object.entries(replacements).reduce(
    (xml, [placeholder, value]) => xml.replaceAll(placeholder, escapeXml(value)),
    slideXml,
  );
}

async function replaceImagePlaceholder({
  zip,
  slideXml,
  slide,
  slideNumber,
}: {
  zip: JSZip;
  slideXml: string;
  slide: SlideData;
  slideNumber: number;
}) {
  if (!slideXml.includes(imagePlaceholder)) {
    return slideXml;
  }

  const imagePath = publicImagePath(slide.images?.[0]);
  if (!imagePath) {
    return slideXml.replaceAll(imagePlaceholder, "");
  }

  const imageBuffer = await readFile(imagePath);
  const extension = getImageExtension(imagePath);
  const mediaName = `template-image-${slideNumber}.${extension}`;
  const mediaPath = `ppt/media/${mediaName}`;
  const relsPath = `ppt/slides/_rels/slide${slideNumber}.xml.rels`;
  const contentTypesPath = "[Content_Types].xml";
  const relsXml = await zip.file(relsPath)?.async("string");
  const rId = nextRelationshipId(relsXml ?? "");

  zip.file(mediaPath, imageBuffer);
  zip.file(relsPath, addImageRelationship(relsXml, rId, `../media/${mediaName}`));

  const contentTypesXml = await zip.file(contentTypesPath)?.async("string");
  if (contentTypesXml) {
    zip.file(contentTypesPath, ensureImageContentType(contentTypesXml, extension));
  }

  return slideXml.replace(/<p:sp\b[\s\S]*?<\/p:sp>/g, (shapeXml) => {
    if (!shapeXml.includes(imagePlaceholder)) {
      return shapeXml;
    }

    return pictureXml(shapeXml, rId);
  });
}

export async function fillTemplatePptx(template: ArrayBuffer, slides: SlideData[]) {
  const zip = await JSZip.loadAsync(template);
  const slideFiles = Object.keys(zip.files)
    .filter((fileName) => /^ppt\/slides\/slide\d+\.xml$/.test(fileName))
    .sort((a, b) => {
      const aNumber = Number(a.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      const bNumber = Number(b.match(/slide(\d+)\.xml/)?.[1] ?? 0);

      return aNumber - bNumber;
    });

  for (const fileName of slideFiles) {
    const slideNumber = Number(fileName.match(/slide(\d+)\.xml/)?.[1] ?? 1);
    const slide = slides[slideNumber - 1] ?? slides[0];

    if (!slide) {
      continue;
    }

    const file = zip.file(fileName);
    const originalXml = await file?.async("string");

    if (!originalXml) {
      continue;
    }

    const withText = replaceTextPlaceholders(originalXml, slide);
    const withImage = await replaceImagePlaceholder({
      zip,
      slideXml: withText,
      slide,
      slideNumber,
    });

    zip.file(fileName, withImage);
  }

  return zip.generateAsync({ type: "arraybuffer" });
}
