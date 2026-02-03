import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "URL de l'image manquante" },
        { status: 400 }
      );
    }

    // Extraire le public_id de l'URL Cloudinary
    // Format URL: https://res.cloudinary.com/[cloud]/image/upload/v[version]/[folder]/[public_id].[ext]
    const matches = imageUrl.match(/\/v\d+\/(.+)\.\w+$/);
    if (!matches || !matches[1]) {
      return NextResponse.json(
        { success: false, error: "URL Cloudinary invalide" },
        { status: 400 }
      );
    }

    const publicId = matches[1];

    // Supprimer l'image de Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok" || result.result === "not found") {
      return NextResponse.json({
        success: true,
        message: "Image supprimée avec succès",
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Échec de la suppression de l'image",
      },
      { status: 500 }
    );
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la suppression de l'image",
      },
      { status: 500 }
    );
  }
}
