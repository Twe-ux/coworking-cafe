import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/api/auth"
import { errorResponse, successResponse } from "@/lib/api/response"
import cloudinary from "@/lib/cloudinary"

// POST /api/upload - Uploader une image vers Cloudinary
export async function POST(request: NextRequest) {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const folder = (formData.get("folder") as string) || "blog"

    if (!file) {
      return errorResponse("Fichier manquant", "Aucun fichier fourni", 400)
    }

    // Vérifier le type de fichier (images uniquement)
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return errorResponse(
        "Type de fichier non supporté",
        "Seules les images (JPEG, PNG, WebP, GIF) sont acceptées",
        400
      )
    }

    // Vérifier la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return errorResponse(
        "Fichier trop volumineux",
        "La taille maximale est de 10MB",
        400
      )
    }

    // Convertir le fichier en Buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload vers Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result)
          }
        )
        .end(buffer)
    })

    const uploadResult = result as any

    return successResponse(
      {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      },
      "Fichier uploadé avec succès",
      201
    )
  } catch (error) {
    console.error("POST /api/upload error:", error)
    return errorResponse(
      "Erreur lors de l'upload",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}

// DELETE /api/upload - Supprimer une image de Cloudinary
export async function DELETE(request: NextRequest) {
  const authResult = await requireAuth(["dev", "admin"])
  if (!authResult.authorized) {
    return authResult.response
  }

  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get("publicId")

    if (!publicId) {
      return errorResponse("Public ID manquant", "publicId requis", 400)
    }

    await cloudinary.uploader.destroy(publicId)

    return successResponse(null, "Image supprimée avec succès")
  } catch (error) {
    console.error("DELETE /api/upload error:", error)
    return errorResponse(
      "Erreur lors de la suppression",
      error instanceof Error ? error.message : "Erreur inconnue"
    )
  }
}
