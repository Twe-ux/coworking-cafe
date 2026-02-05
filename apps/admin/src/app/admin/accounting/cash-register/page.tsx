"use client";

import { CashRegisterHistory } from "@/components/cash-register/CashRegisterHistory";

export default function CashRegisterAdminPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">💰 Suivi Fond de Caisse</h1>
        <p className="text-muted-foreground mt-2">
          Récapitulatif des saisies staff
        </p>
      </div>

      {/* Historique */}
      <CashRegisterHistory showDetailsColumn={true} />
    </div>
  );
}
