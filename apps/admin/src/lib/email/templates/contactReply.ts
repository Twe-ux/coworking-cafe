/**
 * Template email : Réponse à un message de contact
 * Couleur : BLEU (#3B82F6)
 *
 * Utilise le même design professionnel que les emails de booking/unavailability
 */

interface ContactReplyEmailData {
  clientName: string;
  clientMessage: string;
  replyMessage: string;
  subject: string;
}

export function generateContactReplyEmail(data: ContactReplyEmailData): string {
  const { clientName, clientMessage, replyMessage, subject } = data;

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
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%) !important;
      }
      .email-content {
        background: #1f2937 !important;
        color: #f3f4f6 !important;
      }
      .email-content p,
      .email-content li,
      .email-content strong,
      .text-body {
        color: #f3f4f6 !important;
      }
      .reply-box {
        background: #111827 !important;
        border-color: #3B82F6 !important;
      }
      .original-message-box {
        background: #111827 !important;
        border-color: #374151 !important;
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
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <!-- Email Container -->
        <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 1px solid #e5e7eb;">

          <!-- Header -->
          <tr>
            <td class="email-header" style="background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); padding: 32px 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">
                💬 Réponse à votre message
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td class="email-content" style="padding: 32px 24px; background: #ffffff; color: #1f2937;">
              <!-- Greeting -->
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #1f2937;">
                Bonjour <strong>${clientName}</strong>,
              </p>

              <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: #1f2937;">
                Merci de nous avoir contactés. Voici notre réponse à votre message concernant "<strong>${subject}</strong>" :
              </p>

              <!-- Reply Box -->
              <table class="reply-box" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #eff6ff; border-left: 4px solid #3B82F6; border-radius: 8px; margin: 0 0 32px 0;">
                <tr>
                  <td style="padding: 24px;">
                    <p style="margin: 0; font-size: 16px; line-height: 1.7; color: #1f2937; white-space: pre-wrap;">${replyMessage}</p>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #1f2937;">
                Cordialement,<br>
                <strong>L'équipe CoworKing Café</strong>
              </p>

              <!-- Separator -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

              <!-- Original Message -->
              <table class="original-message-box" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #6b7280;">
                      📝 Votre message original
                    </p>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4b5563; white-space: pre-wrap;">${clientMessage}</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer" style="background: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p class="footer-text" style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600; color: #1f2937;">
                CoworKing Café
              </p>
              <p class="footer-text" style="margin: 0 0 4px 0; font-size: 13px; color: #6b7280;">
                Espace de coworking à Strasbourg
              </p>
              <p class="footer-text" style="margin: 0; font-size: 12px; color: #9ca3af;">
                Cet email a été envoyé en réponse à votre demande de contact
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
