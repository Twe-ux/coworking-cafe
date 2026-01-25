"use client";

/**
 * ContractGenerationModal
 * Modal for generating employment contracts as PDF
 *
 * Structure:
 * - index.tsx (this file): Main modal component
 * - types.ts: TypeScript interfaces
 * - hooks/useContractCalculations.ts: Salary/hours calculations
 * - hooks/useContractGeneration.ts: PDF generation logic
 */

import { useState, useEffect } from "react";
import { FileText, FileDown, Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import type { ContractGenerationModalProps } from "./types";
import { useContractGeneration } from "./hooks/useContractGeneration";
import { useContractCalculations } from "./hooks/useContractCalculations";
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
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Chargement de l'aperçu PDF...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full border rounded-lg overflow-hidden bg-gray-100">
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
  const [emailAddress, setEmailAddress] = useState(employee.email || "");
  const [showEmailInput, setShowEmailInput] = useState(false);

  const { monthlySalary, monthlyHours } = useContractCalculations({ employee });

  const { generating, sending, generatePDF, sendEmail } = useContractGeneration(
    {
      employee,
      monthlySalary,
      monthlyHours,
      onSuccess: () => onOpenChange(false),
    },
  );

  const handleSendEmail = async () => {
    if (!emailAddress) {
      alert("Veuillez saisir une adresse email");
      return;
    }
    await sendEmail(emailAddress);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Contrat de Travail - {employee.firstName} {employee.lastName}
          </DialogTitle>
        </DialogHeader>

        {/* PDF Preview */}
        <div className="bg-gray-200 rounded-xl h-[calc(95vh-200px)]">
          <PDFPreviewComponent
            employee={employee}
            monthlySalary={monthlySalary}
            monthlyHours={monthlyHours}
          />
        </div>

        {/* Email input */}
        {showEmailInput && (
          <div className="flex items-center gap-2 border-t pt-4">
            <Label
              htmlFor="email-address"
              className="text-sm whitespace-nowrap"
            >
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
              <Button
                onClick={handleSendEmail}
                disabled={sending || !emailAddress}
              >
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
