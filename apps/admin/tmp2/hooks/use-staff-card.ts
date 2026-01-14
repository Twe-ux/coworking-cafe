import * as React from "react";
import toast from "react-hot-toast";

// Types pour la gestion des shifts
export interface ShiftData {
  firstShift: {
    start: string;
    end: string;
  };
  secondShift: {
    start: string;
    end: string;
  };
  _id?: string;
}

export type ShiftType = "first" | "second" | null;

// Hook personnalisé pour gérer l'état des shifts
export function useShiftState() {
  const [currentShiftData, setCurrentShiftData] =
    React.useState<ShiftData | null>(null);
  const [activeShift, setActiveShift] = React.useState<ShiftType>(null);
  const [isFirstShiftActive, setIsFirstShiftActive] = React.useState(false);
  const [isSecondShiftActive, setIsSecondShiftActive] = React.useState(false);
  const [firstShiftElapsed, setFirstShiftElapsed] = React.useState("");
  const [secondShiftElapsed, setSecondShiftElapsed] = React.useState("");

  return {
    // État
    currentShiftData,
    activeShift,
    isFirstShiftActive,
    isSecondShiftActive,
    firstShiftElapsed,
    secondShiftElapsed,
    // Setters
    setCurrentShiftData,
    setActiveShift,
    setIsFirstShiftActive,
    setIsSecondShiftActive,
    setFirstShiftElapsed,
    setSecondShiftElapsed,
  };
}

// Hook pour gérer l'authentification par mot de passe
export function usePasswordAuth() {
  const [passwordPrompt, setPasswordPrompt] = React.useState(false);
  const [enteredPassword, setEnteredPassword] = React.useState("");
  const [isBlocked, setIsBlocked] = React.useState(false);

  const validatePassword = (
    expectedPassword: number,
    onSuccess: () => void,
  ) => {
    if (parseInt(enteredPassword) === expectedPassword) {
      setPasswordPrompt(false);
      setEnteredPassword("");
      onSuccess();
    } else {
      toast.error("Mot de passe incorrect");
      setEnteredPassword("");
    }
  };

  const promptForPassword = () => {
    setPasswordPrompt(true);
  };

  const cancelPassword = () => {
    setPasswordPrompt(false);
    setEnteredPassword("");
  };

  return {
    // État
    passwordPrompt,
    enteredPassword,
    isBlocked,
    // Actions
    validatePassword,
    promptForPassword,
    cancelPassword,
    setEnteredPassword,
    setIsBlocked,
  };
}

// Hook pour gérer les formulaires de staff
export function useStaffForm(initialData: {
  firstname: string;
  lastname: string;
  staffId: string;
  hidden: string;
}) {
  const [form, setForm] = React.useState({
    date: new Date().toISOString().slice(0, 10),
    firstname: initialData.firstname || "",
    lastname: initialData.lastname || "",
    staffId: initialData.staffId || "",
    hidden: initialData.hidden || "",
  });

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm({
      date: new Date().toISOString().slice(0, 10),
      firstname: initialData.firstname || "",
      lastname: initialData.lastname || "",
      staffId: initialData.staffId || "",
      hidden: initialData.hidden || "",
    });
  };

  return {
    form,
    updateForm,
    resetForm,
    setForm,
  };
}

// Utilitaires pour le calcul des durées de shift
export const shiftUtils = {
  calculateElapsedTime: (startTime: string): string => {
    if (!startTime) return "";

    const start = new Date(startTime);
    const now = new Date();
    const elapsed = now.getTime() - start.getTime();

    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  },

  formatShiftTime: (timeString: string): string => {
    if (!timeString) return "--:--";

    const date = new Date(timeString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  isShiftActive: (
    shiftData: ShiftData | null,
    shiftType: "first" | "second",
  ): boolean => {
    if (!shiftData) return false;

    const shift =
      shiftType === "first" ? shiftData.firstShift : shiftData.secondShift;
    return !!shift.start && !shift.end;
  },

  getShiftDuration: (start: string, end?: string): string => {
    if (!start) return "";

    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    const duration = endDate.getTime() - startDate.getTime();

    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  },
};

// Types pour l'export
export type StaffFormData = ReturnType<typeof useStaffForm>["form"];
export type ShiftState = ReturnType<typeof useShiftState>;
export type PasswordAuth = ReturnType<typeof usePasswordAuth>;
