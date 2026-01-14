import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { options as authOptions } from "@/lib/auth-options";
import cloudinary from "@/lib/cloudinary";
import { logger } from "@/lib/logger";
import { optimizeImage, shouldOptimize } from "@/lib/image-optimizer";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Check if user is admin or higher (level >= 80)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);

    // Optimiser automatiquement l'image
    if (shouldOptimize(file.type, file.size)) {
      try {
        const optimized = await optimizeImage(buffer, { folder: 'spaces' });
        buffer = optimized.buffer;
        logger.info('Image optimisée:', {
          data: {
            savings: `${optimized.metadata.savings}%`,
            size: `${(optimized.metadata.size / 1024).toFixed(1)}KB`
          }
        });
      } catch (error) {
        logger.warn('Échec de l\'optimisation, upload de l\'image originale');
      }
    }

    // Convert buffer to base64
    const base64 = `data:image/webp;base64,${buffer.toString("base64")}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64, {
      folder: "booking/spaces",
      resource_type: "auto",
    });

    logger.info("Image uploaded to Cloudinary:", { data: { publicId: result.public_id } });

    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    logger.error("Error uploading image:", { data: error });
    return NextResponse.json(
      { error: "Erreur lors de l'upload de l'image" },
      { status: 500 }
    );
  }
}
