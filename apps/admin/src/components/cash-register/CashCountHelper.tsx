"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CashCountDetails } from "@/types/cashRegister";
import {
  calculateTotalFromDetails,
  formatCurrency,
  getEmptyCountDetails,
} from "@/types/cashRegister";
import { useEffect, useState } from "react";

interface CashCountHelperProps {
  onTotalCalculated: (total: number, details: CashCountDetails) => void;
  className?: string;
}

export function CashCountHelper({
  onTotalCalculated,
  className = "",
}: CashCountHelperProps) {
  const [countDetails, setCountDetails] = useState<CashCountDetails>(
    getEmptyCountDetails(),
  );
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const newTotal = calculateTotalFromDetails(countDetails);
    setTotal(newTotal);
  }, [countDetails]);

  const updateBillQuantity = (value: number, quantity: number) => {
    setCountDetails((prev) => ({
      ...prev,
      bills: prev.bills.map((bill) =>
        bill.value === value ? { ...bill, quantity } : bill,
      ),
    }));
  };

  const updateCoinQuantity = (value: number, quantity: number) => {
    setCountDetails((prev) => ({
      ...prev,
      coins: prev.coins.map((coin) =>
        coin.value === value ? { ...coin, quantity } : coin,
      ),
    }));
  };

  const handleReport = () => {
    onTotalCalculated(total, countDetails);
  };

  const handleReset = () => {
    setCountDetails(getEmptyCountDetails());
    setTotal(0);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Grille 2 colonnes: Pièces | Billets */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pièces */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pièces</CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs h-8">Valeur</TableHead>
                  <TableHead className="text-xs h-8 w-16">Qté</TableHead>
                  <TableHead className="text-xs h-8 text-right">
                    Total
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countDetails.coins.map((coin) => (
                  <TableRow key={`coin-${coin.value}`} className="h-10">
                    <TableCell className="text-sm font-medium">
                      {formatCurrency(coin.value)}
                    </TableCell>
                    <TableCell className="p-1">
                      <Input
                        type="number"
                        min="0"
                        value={coin.quantity}
                        onChange={(e) =>
                          updateCoinQuantity(
                            coin.value,
                            parseInt(e.target.value) || 0,
                          )
                        }
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.currentTarget.select()}
                        className="h-8 w-14 text-center p-1"
                      />
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      {formatCurrency(coin.value * coin.quantity)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Billets + Total */}
        <div className="space-y-3 flex flex-col justify-between">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Billets</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs h-8">Valeur</TableHead>
                    <TableHead className="text-xs h-8 w-16">Qté</TableHead>
                    <TableHead className="text-xs h-8 text-right">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {countDetails.bills.map((bill) => (
                    <TableRow key={`bill-${bill.value}`} className="h-10">
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(bill.value)}
                      </TableCell>
                      <TableCell className="p-1">
                        <Input
                          type="number"
                          min="0"
                          value={bill.quantity}
                          onChange={(e) =>
                            updateBillQuantity(
                              bill.value,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          onFocus={(e) => e.target.select()}
                          onClick={(e) => e.currentTarget.select()}
                          className="h-8 w-14 text-center p-1"
                        />
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">
                        {formatCurrency(bill.value * bill.quantity)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Total */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base font-semibold">Total :</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset} size="sm">
                  Réinitialiser
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={total === 0}
                  className="flex-1"
                  size="sm"
                >
                  Reporter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
