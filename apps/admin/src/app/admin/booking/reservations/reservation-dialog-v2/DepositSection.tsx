"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Upload, FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DepositSectionProps } from "./types"

export function DepositSection({
  required,
  amount,
  fileAttached,
  fileUrl,
  onRequiredChange,
  onAmountChange,
  onFileAttachedChange,
  onFileUploaded,
  spaceType,
}: DepositSectionProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [manualUrl, setManualUrl] = useState("")
  const [useManualUrl, setUseManualUrl] = useState(false) // Démarrer avec upload par défaut

  // Only show for salle-etage and evenementiel
  if (spaceType !== "salle-etage" && spaceType !== "evenementiel") {
    return null
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Vérifier la variable d'environnement
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "coworking-deposits"

    if (!cloudName) {
      setUploadError("Configuration Cloudinary manquante. Utilisez la saisie manuelle d'URL.")
      setUseManualUrl(true)
      return
    }

    try {
      setUploading(true)
      setUploadError(null)

      // Create FormData
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", uploadPreset)

      // Upload to Cloudinary avec auto-detection
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`

      console.log("📤 Uploading file:", file.name, "size:", (file.size / 1024 / 1024).toFixed(2), "MB")
      console.log("📤 Using preset:", uploadPreset)

      const response = await fetch(cloudinaryUrl, {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      console.log("📥 Cloudinary response:", data)

      if (data.secure_url) {
        onFileUploaded(data.secure_url)
        console.log("✅ File uploaded successfully:", data.secure_url)
      } else if (data.error) {
        console.error("❌ Cloudinary error:", data.error)
        setUploadError(`Upload échoué: ${data.error.message}. Créez un preset "unsigned" nommé "${uploadPreset}" dans Cloudinary → Settings → Upload`)
      } else {
        setUploadError("L'upload a échoué. Vérifiez que le fichier est valide.")
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      setUploadError("Erreur réseau lors de l'upload.")
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveFile = () => {
    console.log("🗑️ File URL removed");
    onFileUploaded("")
    setUploadError(null)
  }

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-amber-50/50">
      <div className="flex items-center justify-between">
        <Label htmlFor="deposit-required" className="text-base font-semibold">
          Acompte requis
        </Label>
        <Checkbox
          id="deposit-required"
          checked={required}
          onCheckedChange={onRequiredChange}
        />
      </div>

      {required && (
        <div className="space-y-4 pt-2">
          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Montant de l'acompte (€) *</Label>
            <Input
              id="deposit-amount"
              type="number"
              min="0"
              step="0.01"
              value={amount || ""}
              onChange={(e) => {
                const value = e.target.value;
                const newAmount = value === "" ? 0 : parseFloat(value) || 0;
                console.log("💰 Deposit amount changed:", newAmount);
                onAmountChange(newAmount);
              }}
              placeholder="100.00"
            />
          </div>

          {/* Checkbox : Joindre un devis */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="attach-file"
              checked={fileAttached}
              onCheckedChange={onFileAttachedChange}
            />
            <Label htmlFor="attach-file" className="text-sm cursor-pointer">
              Joindre un devis
            </Label>
          </div>

          {/* File Upload or Manual URL (only if fileAttached) */}
          {fileAttached && (
            <div className="space-y-2">
              <Label htmlFor="deposit-file">Devis / Document *</Label>

            {!fileUrl ? (
              <div className="space-y-3">
                {useManualUrl ? (
                  <div>
                    <div className="flex gap-2">
                      <Input
                        type="url"
                        placeholder="https://drive.google.com/... ou https://dropbox.com/..."
                        value={manualUrl}
                        onChange={(e) => setManualUrl(e.target.value)}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (manualUrl) {
                            console.log("📎 File URL added:", manualUrl);
                            onFileUploaded(manualUrl)
                            setManualUrl("")
                          }
                        }}
                        disabled={!manualUrl}
                      >
                        OK
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      💡 Partagez le fichier sur Google Drive/Dropbox et collez le lien
                    </p>
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => setUseManualUrl(false)}
                      className="h-auto p-0 text-xs"
                    >
                      Ou uploader directement un fichier
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Input
                      id="deposit-file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={uploading}
                      className="cursor-pointer"
                    />
                    {uploading && (
                      <p className="text-xs text-blue-600 mt-1">
                        ⏳ Upload en cours...
                      </p>
                    )}
                    {uploadError && (
                      <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-700">
                        ⚠️ {uploadError}
                      </div>
                    )}
                    {!uploading && !uploadError && (
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, JPG, PNG acceptés (max 10MB)
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      onClick={() => {
                        setUseManualUrl(true)
                        setUploadError(null)
                      }}
                      className="h-auto p-0 text-xs"
                    >
                      Ou coller un lien Google Drive/Dropbox
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-green-50">
                <FileText className="h-5 w-5 text-green-600" />
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-blue-600 hover:underline truncate"
                >
                  {fileUrl.length > 50 ? fileUrl.substring(0, 50) + "..." : fileUrl}
                </a>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  title="Supprimer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          )}

          {!fileAttached && (
            <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded">
              ℹ️ Un devis sera transmis ultérieurement au client par email
            </p>
          )}

          <p className="text-xs text-amber-700 bg-amber-100 p-2 rounded">
            ⚠️ La réservation sera validée à réception de l'acompte et validation des conditions d'annulation par retour de mail
          </p>
        </div>
      )}

      {!required && (
        <p className="text-sm text-muted-foreground">
          Réservation acceptée sans acompte
        </p>
      )}
    </div>
  )
}
