"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, CheckCircle, FileDown, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { generateInventoryPDF } from "@/lib/pdf/inventory-pdf";
import { toast } from "sonner";
import type { InventoryEntry } from "@/types/inventory";

interface InventoryEntryHeaderProps {
  entry: InventoryEntry;
  finalizing: boolean;
  unfinalizing?: boolean;
  onBack: () => void;
  onUpdateTitle: (title: string) => Promise<void>;
  onFinalize: () => void;
  onUnfinalize?: () => void;
  valorization?: {
    stockFinalValue: number;
    consumptionValue: number;
    totalValue: number;
  } | null;
}

export function InventoryEntryHeader({
  entry,
  finalizing,
  unfinalizing = false,
  onBack,
  onUpdateTitle,
  onFinalize,
  onUnfinalize,
  valorization,
}: InventoryEntryHeaderProps) {
  const isDraft = entry.status === "draft";
  const [title, setTitle] = useState(
    entry.title || `Inventaire du ${entry.date}`,
  );
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleExportPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      await generateInventoryPDF({
        title: entry.title || `Inventaire du ${entry.date}`,
        date: entry.date,
        items: entry.items.map((item) => ({
          productName: item.productName,
          category: 'divers', // Category not stored in entry items, default for PDF
          theoreticalQty: item.theoreticalQty,
          actualQty: item.actualQty,
          variance: item.variance,
          unitPriceHT: item.unitPriceHT,
          varianceValue: item.varianceValue || 0,
        })),
        valorization: valorization || undefined,
      });
      toast.success('PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      toast.error('Erreur lors de la génération du PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  useEffect(() => {
    setTitle(entry.title || `Inventaire du ${entry.date}`);
  }, [entry.title, entry.date]);

  // Auto-save title 1s after last keystroke
  useEffect(() => {
    if (!isDraft) return;

    if (saveTimeout.current) clearTimeout(saveTimeout.current);

    if (title !== entry.title) {
      saveTimeout.current = setTimeout(() => {
        onUpdateTitle(title);
      }, 1000);
    }

    return () => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
    };
  }, [title, entry.title, isDraft, onUpdateTitle]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {isDraft ? (
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xl font-bold border-0 border-b-2 border-gray-300 focus:border-green-500 rounded-none px-2 h-auto w-96"
              placeholder="Nom de l'inventaire"
            />
          ) : (
            <h1 className="text-2xl font-bold">{title}</h1>
          )}
          <Badge
            variant="outline"
            className={`text-xs pointer-events-none ${
              entry.type === "monthly"
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-purple-500 bg-purple-50 text-purple-700"
            }`}
          >
            {entry.type === "monthly" ? "Mensuel" : "Hebdomadaire"}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs pointer-events-none ${
              entry.status === "finalized"
                ? "border-green-500 bg-green-50 text-green-700"
                : "border-yellow-500 bg-yellow-50 text-yellow-700"
            }`}
          >
            {entry.status === "finalized" ? "Finalisé" : "Brouillon"}
          </Badge>
        </div>

        <div className="flex justify-end gap-2">
          {!isDraft && onUnfinalize && entry.canUnfinalize && (
            <Button
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-700 hover:bg-orange-50 hover:text-orange-700"
              onClick={onUnfinalize}
              disabled={unfinalizing}
            >
              <Undo2 className="mr-2 h-4 w-4" />
              {unfinalizing ? 'Définalisation...' : 'Définaliser'}
            </Button>
          )}
          {!isDraft && (
            <Button
              variant="outline"
              size="sm"
              className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
            >
              <FileDown className="mr-2 h-4 w-4" />
              {isGeneratingPDF ? 'Génération...' : 'Télécharger PDF'}
            </Button>
          )}
          {isDraft && (
            <Button
              variant="outline"
              size="sm"
              className="border-green-500 text-green-700 hover:bg-green-50 hover:text-green-700"
              onClick={onFinalize}
              disabled={finalizing}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Finaliser
            </Button>
          )}
        </div>
      </div>

      <p className="text-muted-foreground text-sm">
        {entry.date} · {entry.items.length} produits
        {entry.staffName && ` · par ${entry.staffName}`}
      </p>
    </div>
  );
}
