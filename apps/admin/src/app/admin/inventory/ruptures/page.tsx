"use client";

import { useEffect } from "react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OutOfStockList } from "@/components/inventory/OutOfStockList";
import { markBadgeSeen } from "@/lib/utils/badge-seen";
import { triggerSidebarRefresh } from "@/lib/events/sidebar-refresh";

export default function RupturesPage() {
  // Mark as seen when visiting the page
  useEffect(() => {
    markBadgeSeen("products");
    triggerSidebarRefresh();
  }, []);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/inventory">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              Ruptures de Stock
            </h1>
            <p className="text-muted-foreground mt-1">
              Gérez la liste de courses des produits en rupture
            </p>
          </div>
        </div>
      </div>

      {/* Out-of-stock list */}
      <OutOfStockList variant="full" showHandled={false} />
    </div>
  );
}
