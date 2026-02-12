/**
 * Metadata parsing utilities for Stripe payment/setup intents
 */

interface ParsedAdditionalService {
  name?: string;
  serviceName?: string;
  quantity?: number;
  unitPrice?: number;
  price?: number;
}

interface ParsedInvoiceDetails {
  companyName?: string;
  siret?: string;
  address?: string;
  [key: string]: unknown;
}

export interface ParsedMetadata {
  additionalServices: ParsedAdditionalService[];
  invoiceDetails?: ParsedInvoiceDetails;
}

/**
 * Safely parse additional services from metadata
 */
export function parseAdditionalServices(
  metadataField: string | undefined
): ParsedAdditionalService[] {
  if (!metadataField) return [];

  try {
    const parsed = JSON.parse(metadataField);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('[MetadataParser] Failed to parse additionalServices:', error);
    return [];
  }
}

/**
 * Safely parse invoice details from metadata
 */
export function parseInvoiceDetails(
  metadataField: string | undefined
): ParsedInvoiceDetails | undefined {
  if (!metadataField) return undefined;

  try {
    return JSON.parse(metadataField);
  } catch (error) {
    console.error('[MetadataParser] Failed to parse invoiceDetails:', error);
    return undefined;
  }
}

/**
 * Parse all metadata fields at once
 */
export function parseMetadata(metadata: Record<string, string>): ParsedMetadata {
  return {
    additionalServices: parseAdditionalServices(metadata.additionalServices),
    invoiceDetails: parseInvoiceDetails(metadata.invoiceDetails),
  };
}

/**
 * Generate unique confirmation number
 */
export function generateConfirmationNumber(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9).toUpperCase();
  return `BT-${timestamp}-${random}`;
}

/**
 * Calculate deposit amount from metadata
 */
export function calculateDepositAmount(metadata: Record<string, string>): number {
  if (metadata.depositAmount) {
    return parseInt(metadata.depositAmount);
  }

  // Fallback: full amount if no specific deposit
  const totalPrice = parseFloat(metadata.totalPrice);
  return Math.round(totalPrice * 100);
}
