/**
 * Extract plain text from markdown content
 * Removes markdown formatting to get clean text
 */
export function extractTextFromMarkdown(markdown: string): string {
  if (!markdown) return '';

  let text = markdown;

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`[^`]*`/g, '');

  // Remove HTML tags
  text = text.replace(/<[^>]*>/g, '');

  // Remove images
  text = text.replace(/!\[([^\]]*)\]\(([^)]*)\)/g, '');

  // Remove links but keep text
  text = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, '$1');

  // Remove headers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold and italic
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2');
  text = text.replace(/(\*|_)(.*?)\1/g, '$2');

  // Remove strikethrough
  text = text.replace(/~~(.*?)~~/g, '$1');

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}$/gm, '');

  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');

  // Remove list markers
  text = text.replace(/^[\s]*[-*+]\s+/gm, '');
  text = text.replace(/^[\s]*\d+\.\s+/gm, '');

  // Remove extra whitespace
  text = text.replace(/\n\s*\n/g, '\n');
  text = text.trim();

  return text;
}

/**
 * Generate a meta description from content
 * @param content - Markdown content
 * @param maxLength - Maximum length (default: 160)
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  const plainText = extractTextFromMarkdown(content);

  if (!plainText) return '';

  if (plainText.length <= maxLength) {
    return plainText;
  }

  // Try to cut at a sentence boundary
  const truncated = plainText.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastExclamation = truncated.lastIndexOf('!');
  const lastQuestion = truncated.lastIndexOf('?');

  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);

  if (lastSentenceEnd > maxLength * 0.7) {
    return truncated.substring(0, lastSentenceEnd + 1).trim();
  }

  // Otherwise, cut at last space
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > 0) {
    return truncated.substring(0, lastSpace).trim() + '...';
  }

  return truncated.trim() + '...';
}

/**
 * Generate a meta title from article title
 * @param title - Article title
 * @param siteName - Site name to append
 * @param maxLength - Maximum length (default: 60)
 */
export function generateMetaTitle(title: string, siteName: string = 'Blog', maxLength: number = 60): string {
  const fullTitle = `${title} | ${siteName}`;

  if (fullTitle.length <= maxLength) {
    return fullTitle;
  }

  // Truncate title to fit with site name
  const availableLength = maxLength - siteName.length - 3; // 3 for " | "

  if (availableLength <= 20) {
    // If not enough space, just use truncated title
    return title.substring(0, maxLength - 3) + '...';
  }

  return `${title.substring(0, availableLength)}... | ${siteName}`;
}
