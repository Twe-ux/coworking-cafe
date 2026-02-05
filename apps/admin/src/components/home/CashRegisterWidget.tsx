"use client";

import { CashCountHelper } from "@/components/cash-register/CashCountHelper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  CashCountDetails,
  CashRegisterEntry,
  EmployeeInfo,
} from "@/types/cashRegister";
import { formatCurrency } from "@/types/cashRegister";
import { Calculator, Coins, FileText, History } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface AdminUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
}

/**
 * Widget Fond de Caisse pour le dashboard staff
 * Version compacte avec confirmation employé/admin
 */
export function CashRegisterWidget() {
  const [lastEntry, setLastEntry] = useState<CashRegisterEntry | null>(null);
  const [clockedEmployees, setClockedEmployees] = useState<EmployeeInfo[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countModalOpen, setCountModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [adminPin, setAdminPin] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [amountDifference, setAmountDifference] = useState(0);
  const [wasWarningConfirmed, setWasWarningConfirmed] = useState(false);
  const [notesModalOpen, setNotesModalOpen] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Récupérer la dernière saisie
      const lastEntryResponse = await fetch("/api/cash-register/list?limit=1");
      const lastEntryResult = await lastEntryResponse.json();
      if (lastEntryResult.success && lastEntryResult.data.entries.length > 0) {
        setLastEntry(lastEntryResult.data.entries[0]);
      }

      // Récupérer les employés pointés
      const employeesResponse = await fetch("/api/hr/employees/clocked");
      const employeesResult = await employeesResponse.json();
      console.log("🔍 API /api/hr/employees/clocked response:", employeesResult);
      if (employeesResult.success) {
        console.log("✅ Employés pointés récupérés:", employeesResult.data);
        setClockedEmployees(employeesResult.data || []);
      } else {
        console.error("❌ Erreur récupération employés pointés:", employeesResult.error);
      }

      // Récupérer les admins
      const adminsResponse = await fetch("/api/admins");
      const adminsResult = await adminsResponse.json();
      if (adminsResult.success) {
        setAdminUsers(adminsResult.data || []);
      }
    } catch (err) {
      console.error("Error fetching cash register data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTotalCalculated = (total: number, details: CashCountDetails) => {
    setAmount(total.toString());
    setCountModalOpen(false);
  };

  const handleValidate = () => {
    setError(null);

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < 0) {
      setError("Montant invalide");
      return;
    }

    // Vérifier l'écart avec le dernier montant
    if (lastEntry) {
      const difference = Math.abs(amountNum - lastEntry.amount);
      if (difference > 5) {
        // Écart supérieur à 5€, afficher l'alerte
        setAmountDifference(amountNum - lastEntry.amount);
        setWarningModalOpen(true);
        return;
      }
    }

    // Pas d'écart important, continuer normalement
    openConfirmModal();
  };

  const openConfirmModal = () => {
    setConfirmModalOpen(true);
    setSelectedAdmin(null);
    setAdminPin("");
    setPinError(null);
  };

  const handleWarningContinue = () => {
    setWarningModalOpen(false);
    setWasWarningConfirmed(true);
    openConfirmModal();
  };

  const handleEmployeeSelect = async (employeeId: string) => {
    const employee = clockedEmployees.find((e) => e.id === employeeId);
    if (!employee) return;

    await submitEntry({
      userId: employee.id,
      name: `${employee.firstName} ${employee.lastName || ""}`,
    });
  };

  const handleAdminSelect = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setAdminPin("");
    setPinError(null);
  };

  const handleAdminConfirm = async () => {
    if (!selectedAdmin) {
      setPinError("Veuillez sélectionner un admin");
      return;
    }

    setPinError(null);

    if (adminPin.length !== 6) {
      setPinError("Le code PIN doit contenir 6 chiffres");
      return;
    }

    // Vérifier le PIN admin
    try {
      const response = await fetch("/api/admins/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId: selectedAdmin._id,
          pin: adminPin,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setPinError(result.error || "Code PIN incorrect");
        return;
      }

      // PIN correct, soumettre avec l'admin
      await submitEntry({
        userId: result.data.id,
        name: result.data.name,
      });
    } catch (err) {
      setPinError("Erreur lors de la vérification du code");
    }
  };

  const submitEntry = async (countedBy: { userId: string; name: string }) => {
    setSubmitting(true);
    setError(null);

    try {
      const amountNum = parseFloat(amount);

      // Construire les notes avec indication si responsable prévenu
      let notes = "Saisie rapide depuis le dashboard";
      if (wasWarningConfirmed) {
        const diff = lastEntry ? amountNum - lastEntry.amount : 0;
        notes += ` - Écart de ${formatCurrency(Math.abs(diff))} (${diff > 0 ? "+" : ""}${formatCurrency(diff)}) - Responsable prévenu`;
      }
      // Ajouter les notes additionnelles si présentes
      if (additionalNotes.trim()) {
        notes += ` - ${additionalNotes.trim()}`;
      }

      const response = await fetch("/api/cash-register/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: getTodayDate(),
          amount: amountNum,
          countedBy,
          notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setAmount("");
        setConfirmModalOpen(false);
        setSelectedAdmin(null);
        setAdminPin("");
        setWasWarningConfirmed(false);
        setAdditionalNotes("");
        fetchData();

        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Erreur lors de la saisie");
        setConfirmModalOpen(false);
      }
    } catch (err) {
      setError("Erreur lors de la saisie");
      setConfirmModalOpen(false);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-green-400 border min-h-64 flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Coins className="h-4 w-4 text-primary" />
          Fond de Caisse
        </CardTitle>
        <Link href="/cash-register">
          <Button
            size="sm"
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700"
          >
            <History className="h-3 w-3" />
            Historique
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="space-y-6 ">
        {/* Dernière saisie - Une ligne */}
        {loading ? (
          <p className="text-xs text-muted-foreground">Chargement...</p>
        ) : lastEntry ? (
          <div className="text-lg text-muted-foreground flex justify-between">
            <span className="">Dernière saisie :</span>{" "}
            {/* {new Date(lastEntry.date).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
            })}{" "}
            - {lastEntry.countedBy.name} -{" "} */}
            <span className="font-bold text-primary">
              {formatCurrency(lastEntry.amount)}
            </span>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Aucune saisie</p>
        )}

        {/* Saisie */}
        <div className="space-y-2">
          <div className="flex gap-2">
            {/* Bouton Aide au comptage */}
            <Dialog open={countModalOpen} onOpenChange={setCountModalOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  title="Aide au comptage"
                >
                  <Calculator className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Aide au comptage</DialogTitle>
                </DialogHeader>
                <CashCountHelper onTotalCalculated={handleTotalCalculated} />
              </DialogContent>
            </Dialog>
            {/* Saisie montant */}
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Montant €"
              className="h-9 text-sm flex-1 max-w-[120px]"
            />

            {/* Bouton Notes */}
            <Dialog open={notesModalOpen} onOpenChange={setNotesModalOpen}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant={additionalNotes ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  title="Ajouter une note"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Note additionnelle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Remarques, incidents, etc."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setAdditionalNotes("");
                        setNotesModalOpen(false);
                      }}
                    >
                      Effacer
                    </Button>
                    <Button onClick={() => setNotesModalOpen(false)}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {error && (
            <Alert variant="destructive" className="py-2">
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="py-2">
              <AlertDescription className="text-xs">
                ✓ Saisie enregistrée !
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleValidate}
            className="w-full h-9 text-sm"
            disabled={submitting || !amount}
          >
            {submitting ? "Enregistrement..." : "Valider"}
          </Button>
        </div>

        {/* Modal d'alerte écart */}
        <AlertDialog open={warningModalOpen} onOpenChange={setWarningModalOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>⚠️ Écart important détecté</AlertDialogTitle>
              <AlertDialogDescription className="space-y-2">
                <p>
                  Le montant saisi diffère de{" "}
                  <span className="font-bold text-destructive">
                    {formatCurrency(Math.abs(amountDifference))}
                  </span>{" "}
                  par rapport au dernier enregistrement.
                </p>
                <p className="text-sm">
                  Dernier montant :{" "}
                  <span className="font-semibold">
                    {lastEntry && formatCurrency(lastEntry.amount)}
                  </span>
                </p>
                <p className="text-sm">
                  Montant actuel :{" "}
                  <span className="font-semibold">
                    {formatCurrency(parseFloat(amount) || 0)}
                  </span>
                </p>
                <p className="font-semibold text-orange-600 mt-4">
                  Veuillez prévenir le responsable avant de continuer.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleWarningContinue}>
                J'ai prévenu, continuer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Modal de confirmation */}
        <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Qui a compté la caisse ?</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Employés pointés */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Employés pointés :</p>
                {clockedEmployees.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {clockedEmployees.map((emp) => (
                      <Button
                        key={emp.id}
                        variant="outline"
                        onClick={() => handleEmployeeSelect(emp.id)}
                        disabled={submitting}
                        className="w-full"
                      >
                        {emp.firstName} {emp.lastName?.charAt(0)}.
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic py-2">
                    Aucun employé pointé actuellement
                  </p>
                )}
              </div>

              {/* Admin/Dev avec sélection + PIN */}
              <div className="space-y-2">
                <p className="text-sm font-medium">Admin / Gérant :</p>

                {/* Sélection admin */}
                <div className="grid grid-cols-2 gap-2">
                  {adminUsers.map((admin) => (
                    <Button
                      key={admin._id}
                      variant={
                        selectedAdmin?._id === admin._id ? "default" : "outline"
                      }
                      onClick={() => handleAdminSelect(admin)}
                      disabled={submitting}
                      className="w-full"
                    >
                      {admin.name}
                    </Button>
                  ))}
                </div>

                {/* Input PIN si admin sélectionné */}
                {selectedAdmin && (
                  <div className="space-y-2 pt-2">
                    <Input
                      type="password"
                      inputMode="numeric"
                      maxLength={6}
                      value={adminPin}
                      onChange={(e) =>
                        setAdminPin(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Code PIN (6 chiffres)"
                      className="text-center text-lg tracking-widest"
                      onFocus={(e) => e.target.select()}
                    />
                    {pinError && (
                      <p className="text-xs text-destructive">{pinError}</p>
                    )}
                    <Button
                      onClick={handleAdminConfirm}
                      disabled={submitting || adminPin.length !== 6}
                      className="w-full"
                    >
                      Confirmer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// Helper
function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
