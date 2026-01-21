import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../lib/api-helpers";
import cloudinary from "../../../lib/cloudinary";
import { optimizeImage, shouldOptimize } from "../../../lib/image-optimizer";

// POST /api/upload - Upload image to Cloudinary (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAuth(["admin", "staff", "dev"]);

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "blog";
    const skipOptimization = formData.get("skipOptimization") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 },
      );
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Invalid file type. Only JPEG, PNG, WebP and GIF are allowed",
        },
        { status: 400 },
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(bytes);
    let optimizationInfo = null;

    // Optimiser automatiquement l'image avant upload si applicable
    if (!skipOptimization && shouldOptimize(file.type, file.size)) {
      try {
        const optimized = await optimizeImage(buffer, { folder });
        buffer = optimized.buffer;
        optimizationInfo = {
          originalSize: optimized.metadata.originalSize,
          optimizedSize: optimized.metadata.size,
          savings: optimized.metadata.savings,
          format: optimized.metadata.format,
          dimensions: {
            width: optimized.metadata.width,
            height: optimized.metadata.height,
          },
        };
      } catch (error) {
        // Continue avec l'image originale en cas d'erreur
      }
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    const uploadResult = result as any;

    return NextResponse.json({
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      optimization: optimizationInfo, // Inclure les infos d'optimisation
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to upload image", details: error.message },
      { status: 500 },
    );
  }
}

// DELETE /api/upload - Delete image from Cloudinary (admin only)
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth(["admin", "staff", "dev"]);

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get("publicId");

    if (!publicId) {
      return NextResponse.json(
        { error: "Public ID is required" },
        { status: 400 },
      );
    }

    await cloudinary.uploader.destroy(publicId);

    return NextResponse.json({
      message: "Image deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to delete image", details: error.message },
      { status: 500 },
    );
  }
}
