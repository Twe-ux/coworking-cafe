"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  TaskCreateData,
  TaskPriority,
  RecurringTaskCreateData,
  RecurrenceType,
} from "@/types/task";
import { TASK_PRIORITY_LABELS, WEEKDAY_LABELS } from "@/types/task";

interface TaskCreateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TaskCreateData) => Promise<void>;
  onSubmitRecurring?: (data: RecurringTaskCreateData) => Promise<void>;
}

export function TaskCreateModal({
  open,
  onOpenChange,
  onSubmit,
  onSubmitRecurring,
}: TaskCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("weekly");
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setIsRecurring(false);
    setRecurrenceType("weekly");
    setRecurrenceDays([]);
  };

  const toggleDay = (day: number) => {
    setRecurrenceDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (isRecurring && onSubmitRecurring) {
        if (recurrenceDays.length === 0) return;
        await onSubmitRecurring({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          recurrenceType,
          recurrenceDays,
        });
      } else {
        await onSubmit({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate || undefined,
        });
      }
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Erreur creation tache:", error);
    } finally {
      setLoading(false);
    }
  };

  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Creer une tache</DialogTitle>
          <DialogDescription>
            Ajoutez une nouvelle tache pour l&apos;equipe
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">
                Titre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Titre de la tache"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                placeholder="Description detaillee..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priorite</Label>
              <Select
                value={priority}
                onValueChange={(v: TaskPriority) => setPriority(v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      {TASK_PRIORITY_LABELS.high}
                    </span>
                  </SelectItem>
                  <SelectItem value="medium">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-orange-500" />
                      {TASK_PRIORITY_LABELS.medium}
                    </span>
                  </SelectItem>
                  <SelectItem value="low">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500" />
                      {TASK_PRIORITY_LABELS.low}
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recurring toggle */}
            {onSubmitRecurring && (
              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                  id="recurring"
                />
                <Label htmlFor="recurring" className="cursor-pointer">
                  Tache recurrente
                </Label>
              </div>
            )}

            {isRecurring ? (
              <>
                {/* Recurrence type */}
                <div className="space-y-2">
                  <Label>Frequence</Label>
                  <Select
                    value={recurrenceType}
                    onValueChange={(v: RecurrenceType) => {
                      setRecurrenceType(v);
                      setRecurrenceDays([]);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Day picker */}
                <div className="space-y-2">
                  <Label>
                    {recurrenceType === "weekly" ? "Jours de la semaine" : "Jours du mois"}
                    <span className="text-red-500"> *</span>
                  </Label>

                  {recurrenceType === "weekly" ? (
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={cn(
                            "w-10 h-10 rounded-lg text-xs font-medium border transition-colors",
                            recurrenceDays.includes(day)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted border-input",
                          )}
                        >
                          {WEEKDAY_LABELS[day]}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-7 gap-1">
                      {monthDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={cn(
                            "h-8 rounded text-xs font-medium border transition-colors",
                            recurrenceDays.includes(day)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-muted border-input",
                          )}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  )}

                  {recurrenceDays.length === 0 && (
                    <p className="text-xs text-red-500">Selectionnez au moins un jour</p>
                  )}
                </div>
              </>
            ) : (
              /* Due date (only for non-recurring) */
              <div className="space-y-2">
                <Label htmlFor="dueDate">Date d&apos;echeance (optionnel)</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || (isRecurring && recurrenceDays.length === 0)}
            >
              {loading ? "Creation..." : "Creer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
