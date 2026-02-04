"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { TASK_PRIORITY_COLORS } from "@/types/task";
import { Calendar, Trash2, Loader2 } from "lucide-react";

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  showDeleteButton?: boolean;
}

export function TaskItem({
  task,
  onToggle,
  onDelete,
  showDeleteButton = false,
}: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const isCompleted = task.status === "completed";
  const borderColor = TASK_PRIORITY_COLORS[task.priority];

  // Formater la date si présente
  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Gérer le toggle avec indicateur de chargement
  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(task);
    } finally {
      // Petit délai pour que l'utilisateur voie bien l'animation
      setTimeout(() => setIsToggling(false), 300);
    }
  };

  return (
    <div
      className={cn(
        "border rounded-lg border-l-4 py-2.5 px-3 hover:bg-muted/50 transition-all duration-300",
        borderColor,
        isCompleted && "opacity-60",
        isToggling && "opacity-50",
      )}
    >
      <div className="flex flex-row gap-3 ">
        {/* Checkbox avec spinner de chargement */}
        <div className="pt-0.5 relative">
          {isToggling ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : (
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              className="h-5 w-5"
            />
          )}
        </div>

        {/* Contenu */}
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row gap-5 items-center">
            <h4
              className={cn(
                "font-medium text-sm",
                isCompleted && "line-through text-gray-500",
              )}
            >
              {task.title}
            </h4>

            {task.description && (
              <p className="text-xs text-gray-600 ">{task.description}</p>
            )}
          </div>
          {/* Date d'échéance */}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Bouton supprimer (si autorisé) */}
        {showDeleteButton && onDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
