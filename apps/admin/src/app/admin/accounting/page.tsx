"use client";

import { Button } from "@/components/ui/button";
import { Calculator, FileText, TrendingUp, BarChart3 } from "lucide-react";
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
              className="h-32 w-full flex flex-col gap-2 hover:bg-accent"
            >
              <Calculator className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">Contrôle de Caisse</span>
              <span className="text-sm text-muted-foreground">
                Gestion des encaissements quotidiens
              </span>
            </Button>
          </Link>

          <Link href="/admin/accounting/b2b-revenue">
            <Button
              variant="outline"
              className="h-32 w-full flex flex-col gap-2 hover:bg-accent"
            >
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">CA B2B</span>
              <span className="text-sm text-muted-foreground">
                Chiffre d'affaires prestations B2B
              </span>
            </Button>
          </Link>

          <Link href="/admin/accounting/consolidated">
            <Button
              variant="outline"
              className="h-32 w-full flex flex-col gap-2 hover:bg-accent"
            >
              <TrendingUp className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">Vue Consolidée</span>
              <span className="text-sm text-muted-foreground">
                CA total (Caisse + B2B)
              </span>
            </Button>
          </Link>

          <Link href="/admin/accounting/stats">
            <Button
              variant="outline"
              className="h-32 w-full flex flex-col gap-2 hover:bg-accent"
            >
              <BarChart3 className="h-8 w-8 text-primary" />
              <span className="text-lg font-semibold">Statistiques</span>
              <span className="text-sm text-muted-foreground">
                Comparaison de périodes
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
