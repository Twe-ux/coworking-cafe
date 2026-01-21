// Placeholder pour l'envoi d'email
// TODO: Utiliser le package @coworking-cafe/email quand il sera configuré

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: SendEmailParams): Promise<void> {
  const { to, subject, html } = params;

  // En développement, logger l'email au lieu de l'envoyer
  if (process.env.NODE_ENV === "development") {
    console.log("=== EMAIL ===");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML: ${html.substring(0, 200)}...`);
    console.log("=============");
    return;
  }

  // En production, utiliser un service d'email (Resend, SendGrid, etc.)
  // TODO: Implémenter avec @coworking-cafe/email
  throw new Error("Email service not configured for production");
}
