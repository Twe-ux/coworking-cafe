"use client";
import { DataTable } from "@/components/dashboard/accounting/cash-control/data-table";
import { useCashEntryDataFixed } from "@/hooks/use-cash-entry-data-fixed";
import { useChartData } from "@/hooks/use-chart-data-fixed";
import { useCallback, useEffect, useMemo, useState } from "react";

// Extend CashEntry type to include prestaB2B
type CashEntry = {
  _id: string;
  date: string;
  depenses?: { label: string; value: number }[];
  prestaB2B: { label: string; value: number }[]; // Not optional anymore
  especes?: number | string;
  virement?: number | string;
  cbClassique?: number | string;
  cbSansContact?: number | string;
  [key: string]: unknown;
};

// Types pour les données de turnover
type TurnoverItem = {
  date: string;
  TVA?: number;
  [key: string]: unknown;
};

import { columns } from "@/components/dashboard/accounting/cash-control/columns";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

const monthsList = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

// Utilitaire pour formater une date en YYYY/MM/DD
function formatDateYYYYMMDD(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

export default function CashControl() {
  // Utiliser nos caches optimisés au lieu de Redux
  const { data: turnoverData } = useChartData(); // Données turnover avec date, TTC, HT
  const { dataCash, refetch: refetchCashEntries } = useCashEntryDataFixed();

  // Les données turnover depuis le cache chart
  const data = turnoverData || [];

  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const currentMonth = new Date().getMonth();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    currentMonth,
  );

  type FormState = {
    _id: string;
    date: string;
    prestaB2B: { label: string; value: string }[];
    depenses: { label: string; value: string }[];
    virement: string;
    especes: string;
    cbClassique: string;
    cbSansContact: string;
  };

  const [form, setForm] = useState<FormState>({
    _id: "",
    date: "",
    prestaB2B: [{ label: "", value: "" }],
    depenses: [{ label: "", value: "" }],
    virement: "",
    especes: "",
    cbClassique: "",
    cbSansContact: "",
  });
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<CashEntryRow | null>(null);

  // Plus besoin des useEffect Redux - les caches se gèrent automatiquement
  // console.log("data", data);

  const years = useMemo(() => {
    if (!data) return [];
    const allYears = data.map((item: TurnoverItem) =>
      new Date(item.date).getFullYear(),
    );
    return Array.from(new Set(allYears)).sort((a: number, b: number) => b - a);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    return data.filter((item: TurnoverItem) => {
      const d = new Date(item.date);
      const yearMatch = selectedYear ? d.getFullYear() === selectedYear : true;
      const monthMatch =
        selectedMonth !== null ? d.getMonth() === selectedMonth : true;
      return yearMatch && monthMatch;
    });
  }, [data, selectedYear, selectedMonth]);

  const mergedData = useMemo(() => {
    if (!filteredData || !dataCash) return [];
    return filteredData.map((turnoverItem: TurnoverItem) => {
      const dateKey = formatDateYYYYMMDD(turnoverItem.date);
      const cashEntry = dataCash.find(
        (entry: unknown) =>
          formatDateYYYYMMDD((entry as CashEntry)._id) === dateKey,
      );
      // On laisse prestaB2B tel que reçu de cashEntry
      return {
        ...turnoverItem,
        ...cashEntry,
        _id: cashEntry?._id || "",
        date: dateKey,
        TVA: (turnoverItem as TurnoverItem).TVA ?? 0,
      };
    });
  }, [filteredData, dataCash]);

  // Définir un type pour les lignes de cash entry
  type CashEntryRow = {
    _id?: string;
    date?: string;
    depenses?: { label: string; value: number }[];
    prestaB2B?: { label: string; value: number }[]; // Ajout de la propriété prestaB2B
    virement?: number | string;
    especes?: number | string;
    cbClassique?: number | string;
    cbSansContact?: number | string;
    [key: string]: unknown;
  };

  // Handler pour suppression (à adapter selon ton API)
  const handleDelete = useCallback(
    async (row: CashEntryRow) => {
      // On utilise l'_id réel de cashentry
      const id = row._id;

      if (!id) {
        alert("Impossible de supprimer : identifiant manquant");
        return;
      }
      try {
        const res = await fetch(`/api/cash-entry/delete?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Erreur lors de la suppression");

        // Rafraîchir le cache au lieu d'utiliser Redux
        await refetchCashEntries();
        setFormStatus("Suppression réussie");
      } catch {
        setFormStatus("Erreur lors de la suppression");
      }
    },
    [refetchCashEntries],
  );

  // Affiche un toast visuel lors d'un succès ou d'une erreur
  useEffect(() => {
    if (formStatus) {
      toast(formStatus, {
        icon: formStatus.toLowerCase().includes("erreur") ? "❌" : "✅",
        duration: 3000,
      });
      setFormStatus(null);
    }
  }, [formStatus]);

  // Handler de soumission du formulaire (à adapter selon ton API)
  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setFormStatus(null);
      // Normalisation de la date (YYYY-MM-DD)
      let dateToSend = form.date;
      if (dateToSend.includes("/")) {
        dateToSend = dateToSend.replaceAll("/", "-");
      }
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateToSend)) {
        const d = new Date(dateToSend);
        if (!isNaN(d.getTime())) {
          dateToSend = d.toISOString().slice(0, 10);
        }
      }
      // Construction du body
      const dateKey = formatDateYYYYMMDD(dateToSend);
      type CashEntryBody = {
        date: string;
        prestaB2B?: { label: string; value: number }[];
        depenses: { label: string; value: number }[];
        especes: number;
        virement: number;
        cbClassique: number;
        cbSansContact: number;
        _id?: string;
        id?: string;
      };

      const bodyData: CashEntryBody = {
        date: dateToSend,
        prestaB2B: form.prestaB2B
          .filter(
            (p: { label: string; value: string }) =>
              p.label && p.value !== "" && !isNaN(Number(p.value)),
          )
          .map((p: { label: string; value: string }) => ({
            label: p.label,
            value: Number(p.value),
          })),
        depenses: form.depenses
          .filter(
            (d: { label: string; value: string }) =>
              d.label && d.value !== "" && !isNaN(Number(d.value)),
          )
          .map((d: { label: string; value: string }) => ({
            label: d.label,
            value: Number(d.value),
          })),
        virement: form.virement !== "" ? Number(form.virement) : 0,
        especes: form.especes !== "" ? Number(form.especes) : 0,
        cbClassique: form.cbClassique !== "" ? Number(form.cbClassique) : 0,
        cbSansContact:
          form.cbSansContact !== "" ? Number(form.cbSansContact) : 0,
      };
      let url = "/api/cash-entry";
      let method: "POST" | "PUT" = "POST";
      if (form._id) {
        url = "/api/cash-entry/update";
        method = "PUT";
        bodyData.id = form._id;
      } else {
        // Pour POST, il faut fournir _id au format YYYY/MM/DD
        bodyData._id = dateKey;
      }
      try {
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyData),
        });
        const result = await res.json();
        if (result.success) {
          setFormStatus(form._id ? "Modification réussie !" : "Ajout réussi !");

          // Rafraîchir le cache au lieu d'utiliser Redux
          await refetchCashEntries();
          setEditingRow(null); // Ferme la fenêtre de saisie
          window.dispatchEvent(new CustomEvent("cash-modal-close")); // Force la fermeture de la modale DataTable
          setForm({
            _id: "",
            date: "",
            prestaB2B: [{ label: "", value: "" }],
            depenses: [{ label: "", value: "" }],
            virement: "",
            especes: "",
            cbClassique: "",
            cbSansContact: "",
          });
        } else {
          setFormStatus(
            "Erreur : " + (result.error || "Impossible d'enregistrer"),
          );
        }
      } catch {
        setFormStatus("Erreur réseau");
      }
    },
    [form, refetchCashEntries],
  );

  // État pour la génération PDF (simplifié)
  const [pdfGenerated, setPdfGenerated] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Fonction pour générer le PDF côté client seulement
  const generatePDF = useCallback(async () => {
    if (typeof window === "undefined") return;

    try {
      setPdfGenerated(false);
      const { pdf } = await import("@react-pdf/renderer");

      const PdfComponent = (await import("@/lib/pdf/pdf-CashControl")).default;
      const blob = await pdf(
        <PdfComponent
          data={mergedData}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfGenerated(true);
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  }, [mergedData, selectedMonth, selectedYear]);

  // Régénérer le PDF quand les données changent
  useEffect(() => {
    if (mergedData.length > 0) {
      generatePDF();
    }
  }, [mergedData, selectedMonth, selectedYear, generatePDF]);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between px-2">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="font-semibold">Année :</span>
          <select
            className="mr-4 rounded border px-3 py-1"
            value={selectedYear ?? ""}
            onChange={(e) =>
              setSelectedYear(e.target.value ? Number(e.target.value) : null)
            }
          >
            {years.map((year: number) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <span className="font-semibold">Mois :</span>
          <select
            className="rounded border px-3 py-1"
            value={selectedMonth ?? ""}
            onChange={(e) =>
              setSelectedMonth(
                e.target.value !== "" ? Number(e.target.value) : null,
              )
            }
          >
            {monthsList.map((month, idx) => (
              <option key={month} value={idx}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={generatePDF}
          disabled={!pdfGenerated && pdfUrl === null}
        >
          {pdfGenerated && pdfUrl ? (
            <a
              href={pdfUrl}
              download={`Journal de bord ${monthsList[selectedMonth ?? 0]} ${selectedYear}.pdf`}
            >
              Télécharger PDF
            </a>
          ) : (
            "Générer PDF"
          )}
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={mergedData}
        form={form}
        setForm={setForm}
        formStatus={formStatus}
        onSubmit={onSubmit}
        editingRow={editingRow}
        onDelete={handleDelete}
      />
    </div>
  );
}
