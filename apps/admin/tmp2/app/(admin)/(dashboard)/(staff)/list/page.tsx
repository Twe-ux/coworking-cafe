"use client";
import { columns } from "@/components/dashboard/staff/list/columns";
import { DataTable } from "@/components/dashboard/staff/list/data-table";
import SwitchWithText from "@/components/dashboard/switch-with-text";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { useStaffDataFixed } from "@/hooks/use-staff-data-fixed";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ListPage() {
  const router = useRouter();
  const [checked, setChecked] = useState(true);

  // Utiliser le hook Singleton optimisé au lieu de Redux
  const { data: staffMembers, isLoading, error } = useStaffDataFixed();

  console.log("🚀 STAFF LIST: Hook state", {
    isLoading,
    hasData: !!staffMembers,
    count: staffMembers?.length || 0,
    error,
  });

  return (
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between py-6">
        <div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className={cn("bg-(--chart-5) text-white hover:bg-(--chart-4)")}
              >
                Créer nouvel employé
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Vous êtes sur le point de créer un nouvel employé
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Cette action prendra quelques minutes, veuillez suivre les
                  étapes et valider chacunes d'entre elles.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  className={cn(
                    "bg-(--chart-5) text-white hover:bg-(--chart-4)",
                  )}
                >
                  <div
                    onClick={() => {
                      router.push("/list/create");
                    }}
                  >
                    Continuer
                  </div>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="flex justify-end px-8 pt-2">
          <SwitchWithText
            checked={checked}
            setChecked={setChecked}
            firstText="INACTIF"
            secondText="ACTIF"
          />
        </div>
      </div>
      <DataTable
        columns={columns}
        data={staffMembers || []}
        checked={checked}
      />
    </div>
  );
}
