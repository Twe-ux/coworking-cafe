import type { CashEntryFormData } from "@/types/accounting";

export interface FormatDateResult {
  dateToSend: string;
  dateKey: string;
}

/**
 * Formate une date du formulaire en format YYYY-MM-DD et YYYY/MM/DD
 * @param dateInput - Date en format string (peut être YYYY/MM/DD ou autre)
 * @returns { dateToSend: "YYYY-MM-DD", dateKey: "YYYY/MM/DD" }
 */
export function formatDate(dateInput: string): FormatDateResult {
  let dateToSend = dateInput;

  // Remplacer les / par des -
  if (dateToSend.includes("/")) {
    dateToSend = dateToSend.replace(/\//g, "-");
  }

  // Vérifier si le format est déjà YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToSend)) {
    const d = new Date(dateToSend);
    if (!isNaN(d.getTime())) {
      dateToSend = d.toISOString().slice(0, 10);
    }
  }

  // Créer la clé MongoDB en YYYY/MM/DD
  const dateKey = dateToSend.replace(/-/g, "/");

  return { dateToSend, dateKey };
}

/**
 * Prépare les données du formulaire pour l'envoi à l'API
 * Filtre les valeurs vides, convertit en nombres, formate la date
 */
export function formatFormDataForAPI(
  form: CashEntryFormData,
  isEdit: boolean
): Record<string, unknown> {
  const { dateToSend, dateKey } = formatDate(form.date);

  const bodyData: Record<string, unknown> = {
    date: dateToSend,
    prestaB2B: form.prestaB2B
      .filter((p) => p.label && p.value !== "" && !isNaN(Number(p.value)))
      .map((p) => ({
        label: p.label,
        value: Number(p.value),
      })),
    depenses: form.depenses
      .filter((d) => d.label && d.value !== "" && !isNaN(Number(d.value)))
      .map((d) => ({
        label: d.label,
        value: Number(d.value),
      })),
    virement: form.virement !== "" ? Number(form.virement) : 0,
    especes: form.especes !== "" ? Number(form.especes) : 0,
    cbClassique: form.cbClassique !== "" ? Number(form.cbClassique) : 0,
    cbSansContact: form.cbSansContact !== "" ? Number(form.cbSansContact) : 0,
  };

  if (isEdit) {
    bodyData.id = form._id;
  } else {
    bodyData._id = dateKey;
  }

  return bodyData;
}

/**
 * Retourne l'URL et la méthode HTTP selon le mode (création ou édition)
 */
export function getAPIEndpoint(isEdit: boolean, id?: string): { url: string; method: "POST" | "PUT" } {
  if (isEdit && id) {
    return { url: `/api/accounting/cash-entries/${id}`, method: "PUT" };
  }
  return { url: "/api/accounting/cash-entries", method: "POST" };
}
