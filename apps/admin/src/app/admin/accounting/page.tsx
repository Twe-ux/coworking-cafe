"use client";

import { Button } from "@/components/ui/button";
import { Calculator, Coins, CreditCard } from "lucide-react";
import Link from "next/link";

export default function AccountingPage() {
  return (
    <div className="space-y-8">
      <div className="px-4 md:px-0">
        <h1 className="text-2xl font-bold mb-6">Comptabilité</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/accounting/cash-control">
            <Button
              variant="outline"
              className="h-32 w-full flex flex-col gap-2 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            >
              <Calculator className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">Contrôle de Caisse</span>
              <span className="text-sm text-muted-foreground">
                Gestion des encaissements quotidiens
              </span>
            </Button>
          </Link>

          <Link href="/admin/accounting/cash-register">
            <Button
              variant="outline"
              className="h-32 w-full flex flex-col gap-2 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            >
              <Coins className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">Fond de Caisse</span>
              <span className="text-sm text-muted-foreground">
                Historique et récapitulatif mensuel
              </span>
            </Button>
          </Link>

          <Link href="/admin/accounting/captured-deposits">
            <Button
              variant="outline"
              className="h-32 w-full flex flex-col gap-2 border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700"
            >
              <CreditCard className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">Empreintes Capturées</span>
              <span className="text-sm text-muted-foreground">
                Suivi des no-show et annulations
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
