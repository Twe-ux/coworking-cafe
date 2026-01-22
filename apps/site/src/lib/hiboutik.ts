/**
 * Hiboutik API Integration
 * Synchronisation des clients avec le système Hiboutik
 */

const HIBOUTIK_API_URL = process.env.HIBOUTIK_API_URL || 'https://anticafe.hiboutik.com/api';
const HIBOUTIK_API_KEY = process.env.HIBOUTIK_API_KEY || '';

interface HiboutikCustomerData {
  customers_first_name?: string;
  customers_last_name?: string;
  customers_company?: string;
  customers_email: string;
  customers_country?: string;
  customers_tax_number?: string;
  customers_phone_number?: string;
  customers_birth_date?: string;
  customers_ref_ext?: string;
  customers_misc?: string;
}

interface HiboutikResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Créer un client dans Hiboutik
 */
export async function createHiboutikCustomer(
  customerData: HiboutikCustomerData
): Promise<HiboutikResponse> {
  try {
    const response = await fetch(`${HIBOUTIK_API_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HIBOUTIK_API_KEY}`,
      },
      body: JSON.stringify(customerData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Hiboutik] API Error:', response.status, errorText);

      return {
        success: false,
        error: `Hiboutik API error: ${response.status}`,
      };
    }

    const data = await response.json();

    console.log('[Hiboutik] Customer created successfully:', data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('[Hiboutik] Error creating customer:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Transformer les données User MongoDB vers format Hiboutik
 */
export function transformUserToHiboutikCustomer(userData: {
  email: string;
  givenName?: string;
  username?: string;
  phone?: string;
  companyName?: string;
  userId: string;
}): HiboutikCustomerData {
  const { email, givenName, username, phone, companyName, userId } = userData;

  // Extraire prénom et nom depuis givenName ou username
  const nameParts = (givenName || username || email.split('@')[0]).split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return {
    customers_first_name: firstName,
    customers_last_name: lastName,
    customers_email: email,
    customers_company: companyName || '',
    customers_phone_number: phone || '',
    customers_country: 'FR', // Par défaut France
    customers_ref_ext: userId, // ID MongoDB pour référence
    customers_misc: `Créé depuis CoworkingCafe.fr le ${new Date().toISOString()}`,
  };
}
