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
import { Download, Mail, Loader2, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PayrollPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  month: number;
  year: number;
}

interface AttachmentPreview {
  filename: string;
  size: number;
  type: "payroll" | "contract" | "dpae" | "resignation";
}

interface EmailPreview {
  subject: string;
  htmlBody: string;
  attachments: AttachmentPreview[];
  hasContract: boolean;
  hasResignation: boolean;
  hasDpae: boolean;
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
  const [emailPreview, setEmailPreview] = useState<EmailPreview | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("email");

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

  // Load email preview when modal opens
  useEffect(() => {
    if (isOpen && pdfBlob) {
      loadEmailPreview();
    }
  }, [isOpen, month, year, pdfBlob]);

  const loadEmailPreview = async () => {
    try {
      setIsLoadingPreview(true);
      const response = await fetch("/api/hr/payroll/preview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          month,
          year,
          pdfSize: pdfBlob?.size || 0,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEmailPreview({
          subject: result.subject,
          htmlBody: result.htmlBody,
          attachments: result.attachments,
          hasContract: result.hasContract,
          hasResignation: result.hasResignation,
          hasDpae: result.hasDpae,
        });
      } else {
        toast.error(result.error || "Erreur lors du chargement de la prévisualisation");
      }
    } catch (error) {
      console.error("Error loading email preview:", error);
      toast.error("Erreur lors du chargement de la prévisualisation");
    } finally {
      setIsLoadingPreview(false);
    }
  };

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Ko";
    if (bytes < 1024) return `${bytes} octets`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case "payroll":
        return "📄";
      case "contract":
        return "📋";
      case "dpae":
        return "📝";
      case "resignation":
        return "📬";
      default:
        return "📎";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Prévisualisation - Paie {monthNames[month - 1]} {year}
          </DialogTitle>
          <DialogDescription>
            Vérifiez le contenu de l'email et les pièces jointes avant l'envoi
          </DialogDescription>
        </DialogHeader>

        {/* Tabs for PDF and Email Preview */}
        <Tabs defaultValue="email" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">Prévisualisation Email</TabsTrigger>
            <TabsTrigger value="pdf">PDF Récapitulatif</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="flex-1 overflow-auto border rounded-lg p-4 bg-gray-50">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : emailPreview ? (
              <div className="space-y-6">
                {/* Email Subject */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Sujet de l'email</Label>
                  <div className="mt-1 p-3 bg-white border rounded-md">
                    <p className="font-medium">{emailPreview.subject}</p>
                  </div>
                </div>

                {/* Attachments List */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">
                    Pièces jointes ({emailPreview.attachments.length})
                  </Label>
                  <div className="mt-2 flex flex-row gap-2">
                    {emailPreview.attachments.map((att, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 p-3 bg-white border rounded-md"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl">{getAttachmentIcon(att.type)}</span>
                          <p className="font-medium text-sm truncate">{att.filename}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <p className="text-xs text-gray-500 font-medium">{formatFileSize(att.size)}</p>
                          <FileText className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Email Body Preview */}
                <div>
                  <Label className="text-sm font-semibold text-gray-700">Contenu de l'email</Label>
                  <div
                    className="mt-1 p-4 bg-white border rounded-md prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: emailPreview.htmlBody }}
                  />
                </div>

                {/* Warning if no supplementary docs */}
                {!emailPreview.hasContract && !emailPreview.hasResignation && !emailPreview.hasDpae && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Aucun document supplémentaire (contrat, DPAE, démission) pour ce mois
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Erreur lors du chargement de la prévisualisation</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pdf" className="flex-1 border rounded-lg overflow-hidden bg-gray-100">
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
          </TabsContent>
        </Tabs>

        {/* Show footer only on PDF tab */}
        {activeTab === "pdf" && (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
