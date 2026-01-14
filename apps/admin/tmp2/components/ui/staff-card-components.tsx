import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShiftData, shiftUtils } from "@/hooks/use-staff-card";
import { Clock, Lock, Play, Square, User } from "lucide-react";
import * as React from "react";

// Composant pour l'invite de mot de passe
interface PasswordPromptProps {
  isOpen: boolean;
  password: string;
  onPasswordChange: (password: string) => void;
  onValidate: () => void;
  onCancel: () => void;
}

export function PasswordPrompt({
  isOpen,
  password,
  onPasswordChange,
  onValidate,
  onCancel,
}: PasswordPromptProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-96 p-6">
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Lock className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Authentification requise</h3>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onValidate()}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onCancel}>
              Annuler
            </Button>
            <Button onClick={onValidate}>Valider</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Composant pour afficher les informations d'un shift
interface ShiftDisplayProps {
  title: string;
  shiftData: ShiftData | null;
  shiftType: "first" | "second";
  isActive: boolean;
  elapsedTime: string;
  onStart: () => void;
  onEnd: () => void;
  variant?: "default" | "secondary";
}

export function ShiftDisplay({
  title,
  shiftData,
  shiftType,
  isActive,
  elapsedTime,
  onStart,
  onEnd,
  variant = "default",
}: ShiftDisplayProps) {
  const shift = shiftData
    ? shiftType === "first"
      ? shiftData.firstShift
      : shiftData.secondShift
    : null;

  return (
    <Card className={`${variant === "secondary" ? "bg-muted/30" : ""}`}>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="flex items-center space-x-2 font-semibold">
            <Clock className="h-4 w-4" />
            <span>{title}</span>
          </h4>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "En cours" : "Arrêté"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-muted-foreground">Début</Label>
            <p className="font-mono">
              {shift?.start ? shiftUtils.formatShiftTime(shift.start) : "--:--"}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">Fin</Label>
            <p className="font-mono">
              {shift?.end ? shiftUtils.formatShiftTime(shift.end) : "--:--"}
            </p>
          </div>
        </div>

        {isActive && (
          <div className="mt-3">
            <Label className="text-muted-foreground">Temps écoulé</Label>
            <p className="text-primary font-mono text-lg font-semibold">
              {elapsedTime}
            </p>
          </div>
        )}

        {shift?.start && shift?.end && (
          <div className="mt-3">
            <Label className="text-muted-foreground">Durée totale</Label>
            <p className="font-mono">
              {shiftUtils.getShiftDuration(shift.start, shift.end)}
            </p>
          </div>
        )}

        <div className="mt-4 flex space-x-2">
          {!isActive ? (
            <Button onClick={onStart} size="sm" className="flex-1">
              <Play className="mr-1 h-4 w-4" />
              Démarrer
            </Button>
          ) : (
            <Button
              onClick={onEnd}
              variant="destructive"
              size="sm"
              className="flex-1"
            >
              <Square className="mr-1 h-4 w-4" />
              Arrêter
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Composant pour afficher les informations du personnel
interface StaffInfoProps {
  firstname: string;
  lastname: string;
  staffId: string;
  isBlocked?: boolean;
}

export function StaffInfo({
  firstname,
  lastname,
  staffId,
  isBlocked = false,
}: StaffInfoProps) {
  return (
    <div className="flex items-center space-x-4 rounded-lg border p-4">
      <div className="flex-shrink-0">
        <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-full">
          <User className="text-primary h-6 w-6" />
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-foreground text-lg font-semibold">
          {firstname} {lastname}
        </h3>
        <p className="text-muted-foreground text-sm">ID: {staffId}</p>
      </div>

      {isBlocked && (
        <Badge variant="destructive">
          <Lock className="mr-1 h-3 w-3" />
          Bloqué
        </Badge>
      )}
    </div>
  );
}

// Composant pour les actions de la carte personnel
interface StaffCardActionsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onBlock?: () => void;
  onUnblock?: () => void;
  isBlocked?: boolean;
  disabled?: boolean;
}

export function StaffCardActions({
  onEdit,
  onDelete,
  onBlock,
  onUnblock,
  isBlocked = false,
  disabled = false,
}: StaffCardActionsProps) {
  return (
    <div className="flex space-x-2 border-t pt-4">
      {onEdit && (
        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          disabled={disabled}
          className="flex-1"
        >
          Modifier
        </Button>
      )}

      {isBlocked
        ? onUnblock && (
            <Button
              variant="outline"
              size="sm"
              onClick={onUnblock}
              disabled={disabled}
              className="flex-1"
            >
              Débloquer
            </Button>
          )
        : onBlock && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBlock}
              disabled={disabled}
              className="flex-1"
            >
              Bloquer
            </Button>
          )}

      {onDelete && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={disabled}
          className="flex-1"
        >
          Supprimer
        </Button>
      )}
    </div>
  );
}

// Composant conteneur pour une carte de personnel complète
interface StaffCardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function StaffCardContainer({
  children,
  className = "",
}: StaffCardContainerProps) {
  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}
