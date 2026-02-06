"use client";

import { AmountWarningDialog } from "@/components/cash-register/AmountWarningDialog";
import { CashCountDialog } from "@/components/cash-register/CashCountDialog";
import { ConfirmationDialog } from "@/components/cash-register/ConfirmationDialog";
import { NotesDialog } from "@/components/cash-register/NotesDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  CashCountDetails,
  CashRegisterEntry,
  EmployeeInfo,
} from "@/types/cashRegister";
import { formatCurrency } from "@/types/cashRegister";
import { Coins, History } from "lucide-react";
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
 * Version compacte optimisée avec confirmation employé/admin
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

      const lastEntryResponse = await fetch("/api/cash-register/list?limit=1");
      const lastEntryResult = await lastEntryResponse.json();
      if (lastEntryResult.success && lastEntryResult.data.entries.length > 0) {
        setLastEntry(lastEntryResult.data.entries[0]);
      }

      const employeesResponse = await fetch("/api/hr/employees/clocked");
      const employeesResult = await employeesResponse.json();
      if (employeesResult.success) {
        setClockedEmployees(employeesResult.data || []);
      }

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

    if (lastEntry) {
      const difference = Math.abs(amountNum - lastEntry.amount);
      if (difference > 5) {
        setAmountDifference(amountNum - lastEntry.amount);
        setWarningModalOpen(true);
        return;
      }
    }

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

      let notes = "Saisie rapide depuis le dashboard";
      if (wasWarningConfirmed) {
        const diff = lastEntry ? amountNum - lastEntry.amount : 0;
        notes += ` - Écart de ${formatCurrency(Math.abs(diff))} (${diff > 0 ? "+" : ""}${formatCurrency(diff)}) - Responsable prévenu`;
      }
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
    <Card className="border-green-400 border h-full flex flex-col  justify-between">
      <CardHeader className="pb-2">
        {/* Vertical stack: Titre + Historique */}
        <div className="space-y-2">
          <CardTitle className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <span>Fond de Caisse</span>
          </CardTitle>
          <Link href="/cash-register" className="block">
            <Button
              size="sm"
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700 h-7 w-full text-xs"
            >
              <History className="h-3 w-3 mr-1" />
              <span>Historique</span>
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {/* Dernière saisie */}
        {loading ? (
          <p className="text-xs text-muted-foreground">Chargement...</p>
        ) : lastEntry ? (
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div className="text-xs text-muted-foreground">Dernière saisie</div>
            <div className="font-bold text-primary text-lg">
              {formatCurrency(lastEntry.amount)}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Aucune saisie</p>
        )}

        {/* Input montant avec boutons autour (tous sur la même ligne) */}
        <div className="flex gap-1.5">
          <CashCountDialog
            open={countModalOpen}
            onOpenChange={setCountModalOpen}
            onTotalCalculated={handleTotalCalculated}
          />

          <Input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant €"
            className="h-8 sm:h-9 text-sm w-20 sm:flex-1"
          />

          <NotesDialog
            open={notesModalOpen}
            onOpenChange={setNotesModalOpen}
            notes={additionalNotes}
            onNotesChange={setAdditionalNotes}
          />
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="py-1.5">
            <AlertDescription className="text-[10px] sm:text-xs">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="py-1.5">
            <AlertDescription className="text-[10px] sm:text-xs">
              ✓ Saisie enregistrée !
            </AlertDescription>
          </Alert>
        )}

        {/* Bouton valider */}
        <Button
          onClick={handleValidate}
          className="w-full h-8 sm:h-9 text-xs sm:text-sm"
          disabled={submitting || !amount}
        >
          {submitting ? "Enregistrement..." : "Valider"}
        </Button>

        {/* Modal d'alerte écart */}
        <AmountWarningDialog
          open={warningModalOpen}
          onOpenChange={setWarningModalOpen}
          amountDifference={amountDifference}
          lastAmount={lastEntry?.amount || null}
          currentAmount={parseFloat(amount) || 0}
          onContinue={handleWarningContinue}
        />

        {/* Modal de confirmation */}
        <ConfirmationDialog
          open={confirmModalOpen}
          onOpenChange={setConfirmModalOpen}
          clockedEmployees={clockedEmployees}
          adminUsers={adminUsers}
          submitting={submitting}
          selectedAdmin={selectedAdmin}
          adminPin={adminPin}
          pinError={pinError}
          onEmployeeSelect={handleEmployeeSelect}
          onAdminSelect={handleAdminSelect}
          onAdminPinChange={setAdminPin}
          onAdminConfirm={handleAdminConfirm}
        />
      </CardContent>
    </Card>
  );
}

// Helper
function getTodayDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
