"use client"

import { useState } from "react"
import { Mail } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Import des templates depuis le package email (à adapter selon la structure)
// Pour l'instant, on utilise des placeholders
const EMAIL_TEMPLATES = {
  bookingInitial: "Template Réservation Initiale",
  validated: "Template Validation",
  confirmation: "Template Confirmation",
  cancellation: "Template Annulation",
  depositHold: "Template Empreinte créée",
  depositCaptured: "Template Empreinte encaissée",
  depositReleased: "Template Empreinte libérée",
  reminder: "Template Rappel",
  reservationCancelledByAdmin: "Template Annulée par admin",
  reservationRejected: "Template Réservation refusée",
  cardSaved: "Template Carte sauvegardée",
  passwordReset: "Template Réinitialisation mot de passe",
}

type EmailType = keyof typeof EMAIL_TEMPLATES

export function EmailPreviewClient() {
  const [emailType, setEmailType] = useState<EmailType>("bookingInitial")

  // TODO: Importer et utiliser les vrais templates depuis @coworking-cafe/email
  const getHtmlContent = (): string => {
    // Placeholder HTML pour le moment
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CoWorking Café</h1>
            </div>
            <div class="content">
              <h2>${EMAIL_TEMPLATES[emailType]}</h2>
              <p>Aperçu du template email : ${emailType}</p>
              <p><strong>Note :</strong> Les vrais templates seront importés depuis @coworking-cafe/email</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Mail className="w-8 h-8" />
          Prévisualisation Emails
        </h1>
        <p className="text-muted-foreground mt-2">
          Testez le rendu visuel des templates d'emails
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Label htmlFor="email-type">Type d'email</Label>
            <Select
              value={emailType}
              onValueChange={(value) => setEmailType(value as EmailType)}
            >
              <SelectTrigger id="email-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EMAIL_TEMPLATES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="border-2 rounded-lg overflow-hidden">
            <iframe
              srcDoc={getHtmlContent()}
              className="w-full h-[800px] border-0"
              title="Email Preview"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted">
        <CardHeader>
          <h3 className="font-semibold">Note de développement</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Les templates d'emails sont dans le package <code>@coworking-cafe/email</code>.
            Cette page permet de les prévisualiser visuellement avant envoi.
            Les vrais templates avec données dynamiques seront intégrés ultérieurement.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
