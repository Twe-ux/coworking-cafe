/**
 * Template email : Commande fournisseur
 * Couleur : ORANGE (#F97316)
 *
 * Envoie au fournisseur le détail d'une commande validée
 */

interface OrderItem {
  productName: string
  supplierReference?: string
  packagingDescription?: string
  quantity: number
  packagingType: string
  unitPriceHT: number
  totalHT: number
}

interface PurchaseOrderEmailData {
  orderNumber: string
  supplierName: string
  items: OrderItem[]
  totalHT: number
  totalTTC: number
  notes?: string
  createdAt: string
}

export function generatePurchaseOrderEmail(data: PurchaseOrderEmailData): string {
  const { orderNumber, supplierName, items, notes, createdAt } = data

  // Filter out auto-generated notes (DLC task notes)
  const shouldShowNotes = notes &&
    !notes.includes('Commande DLC générée automatiquement') &&
    !notes.includes('Référence tâche:')

  // Translate packaging types to French with plural support
  const translatePackagingType = (type: string, quantity: number): string => {
    const isPlural = quantity > 1

    const translations: Record<string, { singular: string; plural: string }> = {
      'unit': { singular: 'unité', plural: 'unités' },
      'pack': { singular: 'pack', plural: 'packs' },
      'kg': { singular: 'kg', plural: 'kg' },
      'L': { singular: 'L', plural: 'L' }
    }

    const translation = translations[type]
    if (!translation) return type

    return isPlural ? translation.plural : translation.singular
  }

  // Generate items rows HTML
  const itemsHtml = items
    .map((item) => {
      const refLine = item.supplierReference
        ? `<br><span style="color: #6b7280; font-size: 12px;">Réf: ${item.supplierReference}</span>`
        : ''
      const packLine = item.packagingDescription
        ? `<br><span style="color: #6b7280; font-size: 12px;">${item.packagingDescription}</span>`
        : ''

      return `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px;">
        ${item.productName}${refLine}${packLine}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; text-align: center; font-family: 'Courier New', monospace;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; text-align: center;">
        ${translatePackagingType(item.packagingType, item.quantity)}
      </td>
    </tr>
  `
    })
    .join('')

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <meta name="x-apple-disable-message-reformatting">
  <style>
    /* Reset */
    body, table, td, p, a, li {
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .email-container {
        background: #1f2937 !important;
        border-color: #374151 !important;
      }
      .email-header {
        background: linear-gradient(135deg, #F97316 0%, #EA580C 100%) !important;
      }
      .email-content {
        background: #1f2937 !important;
        color: #f3f4f6 !important;
      }
      .email-content p,
      .email-content td,
      .email-content th,
      .email-content strong,
      .text-body {
        color: #f3f4f6 !important;
      }
      .order-table {
        border-color: #374151 !important;
      }
      .order-table th {
        background: #111827 !important;
        color: #f3f4f6 !important;
        border-color: #374151 !important;
      }
      .order-table td {
        border-color: #374151 !important;
        color: #f3f4f6 !important;
      }
      .totals-box {
        background: #111827 !important;
        border-color: #374151 !important;
      }
      .notes-box {
        background: #111827 !important;
        border-color: #F97316 !important;
      }
      .footer {
        background: #111827 !important;
        color: #9ca3af !important;
        border-color: #374151 !important;
      }
      .footer p,
      .footer-text {
        color: #9ca3af !important;
      }
    }

    /* Responsive */
    @media screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .email-header h1 {
        font-size: 20px !important;
      }
      .email-content {
        padding: 20px !important;
      }
      .order-table {
        font-size: 12px !important;
      }
      .order-table th,
      .order-table td {
        padding: 8px 4px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Email Container -->
        <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="650" style="max-width: 650px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td class="email-header" style="background: linear-gradient(135deg, #F97316 0%, #EA580C 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                📦 Nouvelle Commande Fournisseur
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="email-content" style="padding: 32px 24px; background: #ffffff; color: #1f2937;">
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #1f2937;">
                Bonjour <strong>${supplierName}</strong>,
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #1f2937;">
                Nous vous transmettons notre commande <strong>${orderNumber}</strong> en date du <strong>${createdAt}</strong>.
              </p>

              <!-- Order Details Table -->
              <table class="order-table" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin: 0 0 24px 0;">
                <!-- Table Header -->
                <thead>
                  <tr>
                    <th style="background: #f9fafb; padding: 12px; text-align: left; font-size: 13px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">
                      Produit
                    </th>
                    <th style="background: #f9fafb; padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">
                      Quantité
                    </th>
                    <th style="background: #f9fafb; padding: 12px; text-align: center; font-size: 13px; font-weight: 600; color: #6b7280; border-bottom: 2px solid #e5e7eb;">
                      Unité
                    </th>
                  </tr>
                </thead>
                <!-- Table Body -->
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              ${
                shouldShowNotes
                  ? `
              <!-- Notes Box -->
              <table class="notes-box" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #fff7ed; border-left: 4px solid #F97316; border-radius: 8px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #F97316;">
                      📝 Notes
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1f2937; white-space: pre-wrap;">${notes}</p>
                  </td>
                </tr>
              </table>
              `
                  : ''
              }

              <!-- Call to Action -->
              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #1f2937;">
                Pour toute question, n'hésitez pas à nous contacter.
              </p>

              <!-- Signature -->
              <p style="margin: 0; font-size: 16px; line-height: 1.6; color: #1f2937;">
                Cordialement,<br>
                <strong>L'équipe CoworKing Café</strong>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer" style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p class="footer-text" style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
                CoworKing Café
              </p>
              <p class="footer-text" style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">
                Espace de coworking et café à Strasbourg
              </p>
              <p class="footer-text" style="margin: 0 0 8px 0; font-size: 13px; color: #6b7280;">
                📍 4 rue de la Krutenau, 67000 Strasbourg
              </p>
              <p class="footer-text" style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">
                📞 03 88 00 00 00
              </p>
              <p class="footer-text" style="margin: 0 0 12px 0; font-size: 13px; color: #6b7280;">
                ✉️ contact@coworkingcafe.fr
              </p>
              <p class="footer-text" style="margin: 0; font-size: 12px; color: #9ca3af;">
                Commande générée automatiquement
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}
