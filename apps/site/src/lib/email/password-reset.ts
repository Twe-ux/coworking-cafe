interface PasswordResetEmailParams {
  userName: string;
  resetUrl: string;
}

export function passwordResetEmail(params: PasswordResetEmailParams): string {
  const { userName, resetUrl } = params;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation de mot de passe</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #417972; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0;">CoworKing Café</h1>
  </div>

  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px;">
    <h2 style="color: #417972;">Réinitialisation de votre mot de passe</h2>

    <p>Bonjour ${userName},</p>

    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" style="background-color: #f2d381; color: #333; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
        Réinitialiser mon mot de passe
      </a>
    </div>

    <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
    <p style="word-break: break-all; color: #417972;">${resetUrl}</p>

    <p><strong>Ce lien expire dans 1 heure.</strong></p>

    <p>Si vous n'avez pas demandé de réinitialisation de mot de passe, ignorez simplement cet email.</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 12px; color: #666;">
      Cet email a été envoyé par CoworKing Café.<br>
      Si vous avez des questions, contactez-nous à contact@coworkingcafe.fr
    </p>
  </div>
</body>
</html>
  `;
}
