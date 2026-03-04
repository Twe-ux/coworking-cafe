"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PayrollPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  month: number;
  year: number;
}

export function PayrollPreviewModal({
  isOpen,
  onClose,
  pdfBlob,
  month,
  year,
}: PayrollPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");

  // Generate PDF URL when blob is available
  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      // Cleanup
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfBlob]);

  // Handle download
  const handleDownload = () => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Paie_${year}-${String(month).padStart(2, "0")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("PDF téléchargé avec succès");
  };

  // Handle send email
  const handleSendEmail = async () => {
    if (!recipientEmail) {
      toast.error("Veuillez saisir une adresse email");
      return;
    }

    if (!pdfBlob) {
      toast.error("PDF non disponible");
      return;
    }

    try {
      setIsSending(true);

      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);

      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Content = base64data.split(",")[1]; // Remove data:application/pdf;base64,

        const response = await fetch("/api/hr/payroll/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientEmail,
            pdfBase64: base64Content,
            month,
            year,
          }),
        });

        const result = await response.json();

        if (result.success) {
          toast.success(`Email envoyé à ${recipientEmail}`);
          onClose();
        } else {
          toast.error(result.error || "Erreur lors de l'envoi de l'email");
        }
      };

      reader.onerror = () => {
        toast.error("Erreur lors de la lecture du PDF");
      };
    } catch (error) {
      console.error("Error sending email:", error);
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setIsSending(false);
    }
  };

  const monthNames = [
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Prévisualisation - Paie {monthNames[month - 1]} {year}
          </DialogTitle>
          <DialogDescription>
            Téléchargez le PDF ou envoyez-le par email à la comptabilité
          </DialogDescription>
        </DialogHeader>

        {/* PDF Preview */}
        <div className="flex-1 border rounded-lg overflow-hidden bg-gray-100">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              title="Aperçu PDF Paie"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-4">
          {/* Email Section */}
          <div className="flex-1 flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="email">Email destinataire</Label>
              <Input
                id="email"
                type="email"
                placeholder="comptabilite@example.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSendEmail}
              disabled={isSending || !recipientEmail}
              variant="outline"
            >
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Envoyer
            </Button>
          </div>

          {/* Download Button */}
          <Button
            onClick={handleDownload}
            disabled={!pdfBlob}
            variant="outline"
            className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
          >
            <Download className="mr-2 h-4 w-4" />
            Télécharger
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
