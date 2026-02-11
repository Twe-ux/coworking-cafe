"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  RecurringTask,
  RecurringTaskUpdateData,
  TaskPriority,
  RecurrenceType,
} from "@/types/task";
import { TASK_PRIORITY_LABELS, WEEKDAY_LABELS } from "@/types/task";
import { Trash2, Pencil, Check, X } from "lucide-react";

interface RecurringTasksManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: RecurringTask[];
  onUpdate: (id: string, data: RecurringTaskUpdateData) => void;
  onDelete: (id: string) => void;
}

function formatDays(template: RecurringTask): string {
  if (template.recurrenceType === "weekly") {
    return template.recurrenceDays
      .sort((a, b) => {
        const order = [1, 2, 3, 4, 5, 6, 0];
        return order.indexOf(a) - order.indexOf(b);
      })
      .map((d) => WEEKDAY_LABELS[d])
      .join(", ");
  }
  return template.recurrenceDays.sort((a, b) => a - b).join(", ");
}

interface EditState {
  title: string;
  description: string;
  priority: TaskPriority;
  recurrenceType: RecurrenceType;
  recurrenceDays: number[];
}

export function RecurringTasksManager({
  open,
  onOpenChange,
  templates,
  onUpdate,
  onDelete,
}: RecurringTasksManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditState>({
    title: "",
    description: "",
    priority: "medium",
    recurrenceType: "weekly",
    recurrenceDays: [],
  });

  const startEdit = (t: RecurringTask) => {
    setEditingId(t.id);
    setEditState({
      title: t.title,
      description: t.description || "",
      priority: t.priority,
      recurrenceType: t.recurrenceType,
      recurrenceDays: [...t.recurrenceDays],
    });
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = () => {
    if (!editingId || !editState.title.trim() || editState.recurrenceDays.length === 0) return;
    onUpdate(editingId, {
      title: editState.title.trim(),
      description: editState.description.trim() || undefined,
      priority: editState.priority,
      recurrenceType: editState.recurrenceType,
      recurrenceDays: editState.recurrenceDays,
    });
    setEditingId(null);
  };

  const toggleDay = (day: number) => {
    setEditState((prev) => ({
      ...prev,
      recurrenceDays: prev.recurrenceDays.includes(day)
        ? prev.recurrenceDays.filter((d) => d !== day)
        : [...prev.recurrenceDays, day],
    }));
  };

  const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Taches recurrentes</DialogTitle>
        </DialogHeader>

        {templates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Aucune tache recurrente configuree
          </p>
        ) : (
          <div className="space-y-3 max-h-[65vh] overflow-y-auto py-2">
            {templates.map((template) =>
              editingId === template.id ? (
                /* Edit mode */
                <div key={template.id} className="border rounded-lg p-3 space-y-3 border-primary">
                  <div className="space-y-2">
                    <Label className="text-xs">Titre</Label>
                    <Input
                      value={editState.title}
                      onChange={(e) => setEditState({ ...editState, title: e.target.value })}
                      maxLength={100}
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Description</Label>
                    <Input
                      value={editState.description}
                      onChange={(e) => setEditState({ ...editState, description: e.target.value })}
                      placeholder="Optionnel"
                      className="h-8 text-sm"
                    />
                  </div>

                  <div className="flex gap-3">
                    <div className="space-y-2 flex-1">
                      <Label className="text-xs">Priorite</Label>
                      <Select
                        value={editState.priority}
                        onValueChange={(v: TaskPriority) =>
                          setEditState({ ...editState, priority: v })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">{TASK_PRIORITY_LABELS.high}</SelectItem>
                          <SelectItem value="medium">{TASK_PRIORITY_LABELS.medium}</SelectItem>
                          <SelectItem value="low">{TASK_PRIORITY_LABELS.low}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 flex-1">
                      <Label className="text-xs">Frequence</Label>
                      <Select
                        value={editState.recurrenceType}
                        onValueChange={(v: RecurrenceType) =>
                          setEditState({ ...editState, recurrenceType: v, recurrenceDays: [] })
                        }
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Jours</Label>
                    {editState.recurrenceType === "weekly" ? (
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5, 6, 0].map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={cn(
                              "w-9 h-9 rounded-lg text-xs font-medium border transition-colors",
                              editState.recurrenceDays.includes(day)
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
                              "h-7 rounded text-xs font-medium border transition-colors",
                              editState.recurrenceDays.includes(day)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background hover:bg-muted border-input",
                            )}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7">
                      <X className="w-3.5 h-3.5 mr-1" />
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveEdit}
                      disabled={!editState.title.trim() || editState.recurrenceDays.length === 0}
                      className="h-7"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" />
                      Enregistrer
                    </Button>
                  </div>
                </div>
              ) : (
                /* Read mode */
                <div
                  key={template.id}
                  className={cn(
                    "border rounded-lg p-3 space-y-2",
                    !template.active && "opacity-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          template.priority === "high" && "bg-red-500",
                          template.priority === "medium" && "bg-orange-500",
                          template.priority === "low" && "bg-green-500",
                        )}
                      />
                      <span className="font-medium text-sm truncate">{template.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        ({TASK_PRIORITY_LABELS[template.priority]})
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(template)}
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Switch
                        checked={template.active}
                        onCheckedChange={(active) => onUpdate(template.id, { active })}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(template.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {template.description && (
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">
                      {template.recurrenceType === "weekly" ? "Hebdomadaire" : "Mensuel"}
                    </span>
                    {" : "}
                    {formatDays(template)}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
