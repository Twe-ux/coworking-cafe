"use client";

import {
  PasswordPrompt,
  ShiftDisplay,
  StaffCardActions,
  StaffCardContainer,
  StaffInfo,
} from "@/components/ui/staff-card-components";
import {
  shiftUtils,
  usePasswordAuth,
  useShiftState,
  useStaffForm,
} from "@/hooks/use-staff-card";
import * as React from "react";
import toast from "react-hot-toast";
import StaffCardFooter from "./staff-card-footer";
import StaffCardHeader from "./staff-card-header";

type StaffCardProps = {
  firstname: string;
  lastname: string;
  staffId: string;
  mdp: number;
  hidden: string;
};

export default function StaffCardRefactored({
  firstname,
  lastname,
  staffId,
  mdp,
  hidden,
}: StaffCardProps) {
  // Hooks personnalisés pour la gestion de l'état
  const shiftState = useShiftState();
  const passwordAuth = usePasswordAuth();
  const staffForm = useStaffForm({ firstname, lastname, staffId, hidden });

  // État pour les timers
  const [timer, setTimer] = React.useState<NodeJS.Timeout | null>(null);

  // Effet pour mettre à jour les temps écoulés
  React.useEffect(() => {
    if (shiftState.isFirstShiftActive || shiftState.isSecondShiftActive) {
      const interval = setInterval(() => {
        if (
          shiftState.isFirstShiftActive &&
          shiftState.currentShiftData?.firstShift.start
        ) {
          const elapsed = shiftUtils.calculateElapsedTime(
            shiftState.currentShiftData.firstShift.start,
          );
          shiftState.setFirstShiftElapsed(elapsed);
        }

        if (
          shiftState.isSecondShiftActive &&
          shiftState.currentShiftData?.secondShift.start
        ) {
          const elapsed = shiftUtils.calculateElapsedTime(
            shiftState.currentShiftData.secondShift.start,
          );
          shiftState.setSecondShiftElapsed(elapsed);
        }
      }, 1000);

      setTimer(interval);

      return () => {
        if (interval) clearInterval(interval);
      };
    } else {
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
    }
  }, [
    shiftState.isFirstShiftActive,
    shiftState.isSecondShiftActive,
    shiftState.currentShiftData,
  ]);

  // Fonction pour charger les données de shift existantes
  const loadShiftData = React.useCallback(async () => {
    try {
      const response = await fetch(
        `/api/dashboard/shift/staff-shift-get?staffId=${staffId}&date=${staffForm.form.date}`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          const existingShift = data[0];
          shiftState.setCurrentShiftData(existingShift);

          // Vérifier l'état des shifts
          const firstActive = shiftUtils.isShiftActive(existingShift, "first");
          const secondActive = shiftUtils.isShiftActive(
            existingShift,
            "second",
          );

          shiftState.setIsFirstShiftActive(firstActive);
          shiftState.setIsSecondShiftActive(secondActive);

          if (firstActive) {
            shiftState.setActiveShift("first");
          } else if (secondActive) {
            shiftState.setActiveShift("second");
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données de shift:", error);
    }
  }, [staffId, staffForm.form.date]);

  // Charger les données au montage et quand la date change
  React.useEffect(() => {
    loadShiftData();
  }, [loadShiftData]);

  // Fonctions pour gérer les shifts
  const startShift = async (shiftType: "first" | "second") => {
    const action = () => {
      // Logique de démarrage du shift
      toast.success(
        `${shiftType === "first" ? "Premier" : "Deuxième"} shift démarré`,
      );
    };

    passwordAuth.promptForPassword();
    // L'action sera exécutée après validation du mot de passe
  };

  const endShift = async (shiftType: "first" | "second") => {
    const action = () => {
      // Logique d'arrêt du shift
      toast.success(
        `${shiftType === "first" ? "Premier" : "Deuxième"} shift terminé`,
      );
    };

    passwordAuth.promptForPassword();
    // L'action sera exécutée après validation du mot de passe
  };

  // Validation du mot de passe avec action
  const handlePasswordValidation = () => {
    passwordAuth.validatePassword(mdp, () => {
      // Ici on exécuterait l'action en attente
    });
  };

  // Actions de gestion du personnel
  const handleEdit = () => {
    toast("Fonction de modification à implémenter", { icon: "ℹ️" });
  };

  const handleDelete = () => {
    toast.error("Fonction de suppression à implémenter");
  };

  const handleBlock = () => {
    passwordAuth.setIsBlocked(true);
    toast(`${firstname} ${lastname} a été bloqué`, { icon: "⚠️" });
  };

  const handleUnblock = () => {
    passwordAuth.setIsBlocked(false);
    toast.success(`${firstname} ${lastname} a été débloqué`);
  };

  return (
    <>
      <StaffCardContainer>
        {/* Header personnalisé existant */}
        <StaffCardHeader
          firstname={firstname}
          lastname={lastname}
          timer={
            shiftState.isFirstShiftActive || shiftState.isSecondShiftActive
          }
        />

        {/* Informations du personnel */}
        <div className="mb-6">
          <StaffInfo
            firstname={firstname}
            lastname={lastname}
            staffId={staffId}
            isBlocked={passwordAuth.isBlocked}
          />
        </div>

        {/* Affichage des shifts */}
        <div className="mb-6 space-y-4">
          <ShiftDisplay
            title="Premier Shift"
            shiftData={shiftState.currentShiftData}
            shiftType="first"
            isActive={shiftState.isFirstShiftActive}
            elapsedTime={shiftState.firstShiftElapsed}
            onStart={() => startShift("first")}
            onEnd={() => endShift("first")}
          />

          <ShiftDisplay
            title="Deuxième Shift"
            shiftData={shiftState.currentShiftData}
            shiftType="second"
            isActive={shiftState.isSecondShiftActive}
            elapsedTime={shiftState.secondShiftElapsed}
            onStart={() => startShift("second")}
            onEnd={() => endShift("second")}
            variant="secondary"
          />
        </div>

        {/* Actions de la carte */}
        <StaffCardActions
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBlock={passwordAuth.isBlocked ? undefined : handleBlock}
          onUnblock={passwordAuth.isBlocked ? handleUnblock : undefined}
          isBlocked={passwordAuth.isBlocked}
          disabled={
            shiftState.isFirstShiftActive || shiftState.isSecondShiftActive
          }
        />

        {/* Footer personnalisé existant */}
        <StaffCardFooter
          firstShift={{
            start: shiftState.currentShiftData?.firstShift?.start || "",
            end: shiftState.currentShiftData?.firstShift?.end || "",
            elapsed: shiftState.firstShiftElapsed || "",
          }}
          secondShift={{
            start: shiftState.currentShiftData?.secondShift?.start || "",
            end: shiftState.currentShiftData?.secondShift?.end || "",
            elapsed: shiftState.secondShiftElapsed || "",
          }}
        />
      </StaffCardContainer>

      {/* Invite de mot de passe */}
      <PasswordPrompt
        isOpen={passwordAuth.passwordPrompt}
        password={passwordAuth.enteredPassword}
        onPasswordChange={passwordAuth.setEnteredPassword}
        onValidate={handlePasswordValidation}
        onCancel={passwordAuth.cancelPassword}
      />
    </>
  );
}
