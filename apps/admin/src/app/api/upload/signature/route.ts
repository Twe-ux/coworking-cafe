import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { folder = "produits" } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Paramètres de l'upload (sans upload_preset pour signed uploads)
    const params = {
      timestamp,
      folder,
    };

    // Générer la signature
    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      success: true,
      data: {
        signature,
        timestamp,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
        folder,
      },
    });
  } catch (error) {
    console.error("Error generating signature:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la génération de la signature",
      },
      { status: 500 }
    );
  }
}
