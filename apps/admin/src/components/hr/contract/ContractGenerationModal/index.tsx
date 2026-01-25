"use client";

/**
 * ContractGenerationModal
 * Modal for generating employment contracts as PDF
 *
 * Structure:
 * - index.tsx (this file): Main modal component (<150 lines)
 * - types.ts: TypeScript interfaces
 * - constants.ts: Configuration (days, company info, styles)
 * - hooks/useContractCalculations.ts: Salary/hours calculations
 * - hooks/useContractGeneration.ts: PDF generation logic
 * - ContractContent.tsx: Assembles all sections (mode edit)
 * - ContractDocument.tsx: PDF template (mode preview + download)
 */

import { useRef, useState, useEffect, Suspense } from "react";
import { FileText, FileDown, Mail, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";

import type { ContractGenerationModalProps } from "./types";
import { useContractGeneration } from "./hooks/useContractGeneration";
import { useContractCalculations } from "./hooks/useContractCalculations";
import { ContractContent } from "./ContractContent";
import type { Employee } from "@/types/hr";

// Re-export for backward compatibility
export type { ContractGenerationModalProps } from "./types";

/**
 * PDF Preview Component (client-side only)
 * Uses @react-pdf/renderer PDFViewer for exact preview
 */
function PDFPreviewComponent({
  employee,
  monthlySalary,
  monthlyHours,
}: {
  employee: Employee;
  monthlySalary: string;
  monthlyHours: string;
}) {
  const [isClient, setIsClient] = useState(false);
  const [PDFViewer, setPDFViewer] = useState<any>(null);
  const [ContractDocument, setContractDocument] = useState<any>(null);

  useEffect(() => {
    setIsClient(true);

    // Import dynamically (client-side only)
    Promise.all([
      import("@react-pdf/renderer"),
      import("@/lib/pdf/templates/contract/ContractDocument"),
    ]).then(([pdfModule, docModule]) => {
      setPDFViewer(() => pdfModule.PDFViewer);
      setContractDocument(() => docModule.default);
    });
  }, []);

  if (!isClient || !PDFViewer || !ContractDocument) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Chargement de l'aperçu PDF...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] border rounded-lg overflow-hidden bg-gray-100">
      <PDFViewer width="100%" height="100%" showToolbar={false}>
        <ContractDocument
          employee={employee}
          monthlySalary={monthlySalary}
          monthlyHours={monthlyHours}
        />
      </PDFViewer>
    </div>
  );
}

export function ContractGenerationModal({
  open,
  onOpenChange,
  employee,
}: ContractGenerationModalProps) {
  const [isEditing, setIsEditing] = useState(true);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [zoom, setZoom] = useState(100);
  const [emailAddress, setEmailAddress] = useState(employee.email || "");
  const [showEmailInput, setShowEmailInput] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);

  const { monthlySalary, monthlyHours } = useContractCalculations({ employee });

  const { generating, sending, generatePDF, sendEmail } = useContractGeneration({
    employee,
    monthlySalary,
    monthlyHours,
    onSuccess: () => onOpenChange(false),
  });

  const handleSendEmail = async () => {
    if (!emailAddress) {
      alert("Veuillez saisir une adresse email");
      return;
    }
    await sendEmail(emailAddress);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contrat de Travail - {employee.firstName} {employee.lastName}
          </DialogTitle>
        </DialogHeader>

        {/* View mode toggle */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-4">
            {viewMode === "edit" && (
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-mode"
                  checked={isEditing}
                  onCheckedChange={setIsEditing}
                />
                <Label htmlFor="edit-mode">
                  {isEditing ? "Mode édition" : "Lecture seule"}
                </Label>
              </div>
            )}

            <div className="flex items-center gap-2 border-l pl-4">
              <Label htmlFor="view-mode" className="text-sm">
                Affichage:
              </Label>
              <select
                id="view-mode"
                value={viewMode}
                onChange={(e) =>
                  setViewMode(e.target.value as "edit" | "preview")
                }
                className="text-sm border rounded px-2 py-1"
              >
                <option value="edit">Édition HTML</option>
                <option value="preview">Aperçu PDF</option>
              </select>
            </div>

            {viewMode === "preview" && (
              <div className="flex items-center gap-2 border-l pl-4">
                <Label htmlFor="zoom" className="text-sm">
                  Zoom:
                </Label>
                <select
                  id="zoom"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="75">75%</option>
                  <option value="100">100%</option>
                  <option value="125">125%</option>
                  <option value="150">150%</option>
                </select>
              </div>
            )}
          </div>
          <span className="text-sm text-muted-foreground">
            {viewMode === "preview"
              ? "Aperçu PDF exact (identique au téléchargement)"
              : isEditing
                ? "Vous pouvez modifier le contrat"
                : "Prévisualisation"}
          </span>
        </div>

        {/* Contract content */}
        {viewMode === "preview" ? (
          // Preview mode: Use PDFViewer for exact preview
          <div
            className="bg-gray-200 py-4 rounded-xl"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.2s ease",
            }}
          >
            <PDFPreviewComponent
              employee={employee}
              monthlySalary={monthlySalary}
              monthlyHours={monthlyHours}
            />
          </div>
        ) : (
          // Edit mode: Use HTML ContractContent
          <ContractContent
            employee={employee}
            isEditing={isEditing}
            monthlySalary={monthlySalary}
            monthlyHours={monthlyHours}
            contractRef={contractRef}
            viewMode={viewMode}
          />
        )}

        {/* Email input */}
        {showEmailInput && (
          <div className="flex items-center gap-2 border-t pt-4">
            <Label htmlFor="email-address" className="text-sm whitespace-nowrap">
              Adresse email:
            </Label>
            <Input
              id="email-address"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              placeholder="exemple@email.com"
              className="flex-1"
            />
          </div>
        )}

        {/* Footer actions */}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>

          {showEmailInput ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmailInput(false);
                  setEmailAddress(employee.email || "");
                }}
              >
                Retour
              </Button>
              <Button onClick={handleSendEmail} disabled={sending || !emailAddress}>
                {sending ? (
                  <>Envoi en cours...</>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Envoyer l'email
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowEmailInput(true)}
                disabled={generating || sending}
              >
                <Mail className="w-4 h-4 mr-2" />
                Envoyer par email
              </Button>
              <Button onClick={generatePDF} disabled={generating || sending}>
                {generating ? (
                  <>Generation en cours...</>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Télécharger le PDF
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Default export for convenience
export default ContractGenerationModal;
