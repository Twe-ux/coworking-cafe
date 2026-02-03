/**
 * Email template for account activation
 * Green theme (#588983) for account activation
 */

interface AccountActivationEmailData {
  userName: string;
  activationUrl: string;
}

export function accountActivationEmail(
  data: AccountActivationEmailData,
): string {
  const { userName, activationUrl } = data;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>
    @media (prefers-color-scheme: dark) {
      .email-container { background: #1f2937 !important; border-color: #374151 !important; }
      .email-header { background: linear-gradient(135deg, #588983 0%, #3d615c 100%) !important; }
      .email-content { background: #1f2937 !important; color: #f3f4f6 !important; }
      .email-content p, .email-content strong { color: #f3f4f6 !important; }
      .url-box { background: #111827 !important; border-color: #374151 !important; }
      .url-text { color: #6ee7b7 !important; }
      .benefit-box { background: #064e3b !important; border-color: #10b981 !important; }
      .benefit-box li { color: #d1fae5 !important; }
      .footer { background: #111827 !important; color: #9ca3af !important; }
      .footer p { color: #9ca3af !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; background-color: #fff;">
  <div class="email-container" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">

    <!-- Header GREEN -->
    <div class="email-header" style="background: linear-gradient(135deg, #588983 0%, #3d615c 100%); color: white; padding: 40px 24px; text-align: center;">
      <h1 style="margin: 0 0 12px 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">🎉 Bienvenue !</h1>
      <p style="margin: 0; font-size: 17px; opacity: 0.95; font-weight: 500;">Votre compte a été créé avec succès</p>
    </div>

    <!-- Contenu -->
    <div class="email-content" style="padding: 36px 24px; line-height: 1.7; color: #1f2937;">
      <p style="margin: 0 0 16px 0; font-size: 16px;">
        Bonjour <strong style="color: #588983;">${userName}</strong>,
      </p>

      <p style="margin: 0 0 24px 0; font-size: 16px;">
        Suite à votre demande de réservation, nous avons créé un compte temporaire pour vous. </p>
      <p style="margin: 0 0 24px 0; font-size: 16px; ">
        Activez-le dès maintenant pour profiter de tous les avantages de votre CoworKing Café !
      </p>

      <!-- Benefits Box -->
      <div class="benefit-box" style="background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 8px; margin: 28px 0;">
        <p style="margin: 0 0 12px 0; font-weight: 700; color: #064e3b; font-size: 16px;">✨ Les avantages de votre compte</p>
        <ul style="margin: 0; padding-left: 20px; color: #064e3b; font-size: 15px; line-height: 1.8;">
          <li><strong>Offre de fidélité</strong> : Découvrir notre programme membre</li>
          <li><strong>News</strong> : Restez informé des dernières actualités</li>
          <li><strong>Réservations</strong> : Suivre et gérer toutes vos réservations</li>
          <li><strong>Dashboard client</strong> : Gérez votre profil et vos préférences</li>
        </ul>
      </div>

      <p style="margin: 28px 0 24px 0; font-size: 16px;">
        Cliquez sur le bouton ci-dessous pour activer votre compte et créer votre mot de passe :
      </p>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 28px 0;">
        <a href="${activationUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important; color: white !important; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Activer mon compte
        </a>
      </div>

      <p style="margin: 28px 0 12px 0; font-size: 14px; color: #6b7280;">
        Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
      </p>

      <!-- URL Box -->
      <div class="url-box" style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 16px; border-radius: 8px; margin: 12px 0 28px 0; word-break: break-all;">
        <p class="url-text" style="margin: 0; font-size: 14px; color: #10b981;">
          ${activationUrl}
        </p>
      </div>

      <p style="margin: 28px 0 0 0; font-size: 16px; line-height: 1.8;">
        À très bientôt,<br>
        <strong style="color: #588983; font-size: 17px;">L'équipe CoworKing Café by Anticafé</strong>
      </p>
    </div>

    <!-- Footer -->
    <div class="footer" style="background: #f9fafb; padding: 24px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 8px 0; font-weight: 700; color: #111827; font-size: 15px;">CoworKing Café by Anticafé</p>
      <p style="margin: 0 0 4px 0; color: #6b7280;">1 rue de la Division Leclerc, 67000 Strasbourg</p>
      <p style="margin: 0; color: #6b7280;">Cet email a été envoyé automatiquement. Merci de ne pas y répondre.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
