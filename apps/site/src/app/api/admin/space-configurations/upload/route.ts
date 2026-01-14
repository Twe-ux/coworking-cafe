import { NextRequest, NextResponse } from "next/server";
import { requireAuth, handleApiError } from "@/lib/api-helpers";
import cloudinary from "@/lib/cloudinary";
import { optimizeImage, shouldOptimize } from "@/lib/image-optimizer";

export async function POST(request: NextRequest) {
  try {    await requireAuth(["admin", "staff", "dev"]);
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "La taille du fichier doit être inférieure à 10MB" },
        { status: 400 }
      );
    }

    // Check file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Type de fichier invalide. Seuls JPEG, PNG, WebP et GIF sont autorisés" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);

    // Optimiser automatiquement l'image
    if (shouldOptimize(file.type, file.size)) {
      try {
        const optimized = await optimizeImage(buffer, { folder: 'spaces' });
        buffer = optimized.buffer;      } catch (error) {
    }
    }

    // Convert to base64
    const base64 = `data:image/webp;base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: "spaces",
      resource_type: "auto",
    });    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {    return handleApiError(error);
  }
}
