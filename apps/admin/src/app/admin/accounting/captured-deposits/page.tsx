"use client";

import { CapturedDepositsTable } from "@/components/accounting/CapturedDepositsTable";

export default function CapturedDepositsPage() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">💳 Empreintes Capturées</h1>
        <p className="text-muted-foreground mt-2">
          Suivi des empreintes bancaires prélevées (no-show et annulations client)
        </p>
      </div>

      {/* Table */}
      <CapturedDepositsTable />
    </div>
  );
}
