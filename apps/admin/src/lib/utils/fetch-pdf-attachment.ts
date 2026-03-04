/**
 * Fetch a PDF from a URL and return it as an email attachment.
 * Used to attach devis/quote PDFs to booking confirmation emails.
 */

interface PdfAttachment {
  filename: string;
  content: Buffer;
}

/**
 * Fetch a PDF file from a URL (Cloudinary, Google Drive, etc.)
 * and return it as a Buffer ready for email attachment.
 *
 * Returns null if the fetch fails (non-blocking).
 */
export async function fetchPdfAttachment(
  fileUrl: string,
  filename: string = "devis.pdf"
): Promise<PdfAttachment | null> {
  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      console.error(
        `[fetchPdfAttachment] Failed to fetch: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const content = Buffer.from(arrayBuffer);

    // Sanity check: file should not be empty
    if (content.length === 0) {
      console.error("[fetchPdfAttachment] Fetched file is empty");
      return null;
    }

    console.log(
      `[fetchPdfAttachment] Fetched ${filename} (${(content.length / 1024).toFixed(1)}KB)`
    );

    return { filename, content };
  } catch (error) {
    console.error("[fetchPdfAttachment] Error:", error);
    return null;
  }
}
