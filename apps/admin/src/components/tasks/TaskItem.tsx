"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Task } from "@/types/task";
import { TASK_PRIORITY_COLORS } from "@/types/task";

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
  const isCompleted = task.status === 'completed';
  const borderColor = TASK_PRIORITY_COLORS[task.priority];

  // Formater la date si présente
  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border-l-4 bg-white hover:bg-gray-50 transition-colors",
        borderColor,
        isCompleted && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <div className="pt-0.5">
        <Checkbox
          checked={isCompleted}
          onCheckedChange={() => onToggle(task)}
          className="h-5 w-5"
        />
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            "font-medium text-sm",
            isCompleted && "line-through text-gray-500"
          )}
        >
          {task.title}
        </h4>

        {task.description && (
          <p className="text-xs text-gray-600 mt-1">{task.description}</p>
        )}

        {/* Date d'échéance */}
        {task.dueDate && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
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
  );
}
