import { env } from "cloudflare:workers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { contributionAssets, contributions } from "@/db/schema";
import { reviewContribution } from "@/lib/contribution-review";

const fieldsSchema = z.object({
  spaceId: z.string().min(2).max(120),
  text: z.string().trim().min(20).max(2500),
  sector: z.string().trim().max(120).optional(),
  observedAt: z.string().trim().max(40).optional(),
  profile: z.string().trim().max(80).optional(),
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
});

const allowedImages = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxImageSize = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const form = await request.formData();
  const parsed = fieldsSchema.safeParse({
    spaceId: form.get("spaceId"),
    text: form.get("text"),
    sector: form.get("sector") || undefined,
    observedAt: form.get("observedAt") || undefined,
    profile: form.get("profile") || undefined,
    latitude: form.get("latitude") || undefined,
    longitude: form.get("longitude") || undefined,
  });
  if (!parsed.success) return NextResponse.json({ error: "Revisá la descripción, el sector y la ubicación ingresada." }, { status: 400 });

  const images = form.getAll("images").filter((item): item is File => item instanceof File && item.size > 0);
  if (images.length > 3) return NextResponse.json({ error: "Podés adjuntar hasta 3 imágenes." }, { status: 400 });
  if (images.some((file) => !allowedImages.has(file.type) || file.size > maxImageSize)) {
    return NextResponse.json({ error: "Usá imágenes JPG, PNG o WebP de hasta 5 MB cada una." }, { status: 400 });
  }

  const review = reviewContribution({ ...parsed.data, imageCount: images.length });

  try {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await getDb().insert(contributions).values({
      id,
      spaceId: parsed.data.spaceId,
      text: parsed.data.text,
      sector: parsed.data.sector || null,
      observedAt: parsed.data.observedAt || null,
      profile: parsed.data.profile || null,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      category: review.category,
      completeness: review.completeness,
      moderationNote: review.moderationNote,
      channel: "web",
      status: review.status,
      createdAt,
    });

    for (const file of images) {
      const assetId = crypto.randomUUID();
      const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
      const objectKey = `contributions/${parsed.data.spaceId}/${id}/${assetId}.${extension}`;
      await env.BUCKET.put(objectKey, await file.arrayBuffer(), { httpMetadata: { contentType: file.type } });
      await getDb().insert(contributionAssets).values({
        id: assetId,
        contributionId: id,
        objectKey,
        fileName: file.name.slice(0, 180),
        mimeType: file.type,
        sizeBytes: file.size,
        createdAt,
      });
    }

    return NextResponse.json({ id, ...review });
  } catch (error) {
    console.error("Contribution storage failed", error);
    return NextResponse.json({ error: "No pudimos guardar el aporte. Probá nuevamente en unos minutos." }, { status: 503 });
  }
}
