"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Task, TaskUpdateData, TaskPriority } from "@/types/task";
import { TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from "@/types/task";
import { Calendar, Trash2, Loader2, Repeat } from "lucide-react";

type EditingField = "title" | "description" | "priority" | "dueDate" | null;

interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onUpdate?: (taskId: string, data: TaskUpdateData) => void;
  onDelete?: (taskId: string) => void;
  onTaskClick?: (task: Task) => void;
  showDeleteButton?: boolean;
  canEdit?: boolean;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; color: string }[] = [
  { value: "high", label: "Urgent", color: "bg-red-500" },
  { value: "medium", label: "Normal", color: "bg-orange-500" },
  { value: "low", label: "Faible", color: "bg-green-500" },
];

export function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
  onTaskClick,
  showDeleteButton = false,
  canEdit = false,
}: TaskItemProps) {
  const [isToggling, setIsToggling] = useState(false);
  const [editingField, setEditingField] = useState<EditingField>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isCompleted = task.status === "completed";
  const borderColor = TASK_PRIORITY_COLORS[task.priority];
  const isRecurring = !!task.recurringTaskId;
  const isHighPriority = task.priority === "high" && !isCompleted;
  const isDLCTask =
    task.metadata &&
    typeof task.metadata === "object" &&
    "type" in task.metadata &&
    task.metadata.type === "dlc_stock_count";
  const isDLCClickable = isDLCTask && !isCompleted && onTaskClick;

  // Focus input when editing starts
  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingField]);

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
  };

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(task);
    } finally {
      setTimeout(() => setIsToggling(false), 300);
    }
  };

  const startEdit = (field: EditingField) => {
    if (!canEdit || isCompleted || !onUpdate) return;
    if (field === "title") setEditValue(task.title);
    else if (field === "description") setEditValue(task.description || "");
    else if (field === "dueDate") setEditValue(task.dueDate || "");
    setEditingField(field);
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue("");
  };

  const saveEdit = (field: EditingField, value?: string) => {
    if (!field || !onUpdate) return;
    const val = value ?? editValue;

    if (field === "title" && val.trim().length === 0) {
      cancelEdit();
      return;
    }

    const data: TaskUpdateData = {};
    if (field === "title") data.title = val.trim();
    else if (field === "description") data.description = val.trim();
    else if (field === "priority") data.priority = val as TaskPriority;
    else if (field === "dueDate") data.dueDate = val || undefined;

    onUpdate(task.id, data);
    setEditingField(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveEdit(editingField);
    else if (e.key === "Escape") cancelEdit();
  };

  return (
    <div
      className={cn(
        "border rounded-lg border-l-4 py-2.5 px-3 transition-all duration-300",
        borderColor,
        isHighPriority && "bg-red-500 text-white",
        isCompleted && "opacity-60",
        isToggling && "opacity-50",
        isDLCClickable && !isHighPriority && "hover:bg-amber-50 cursor-pointer",
        isDLCClickable && isHighPriority && "hover:bg-red-600 cursor-pointer",
        !isDLCClickable && !isHighPriority && "hover:bg-green-50",
        !isDLCClickable && isHighPriority && "hover:bg-red-600",
      )}
      onClick={() => {
        if (isDLCClickable) {
          onTaskClick(task);
        }
      }}
    >
      <div className="flex flex-row gap-3">
        {/* Checkbox */}
        <div className="pt-0.5 relative">
          {isToggling ? (
            <Loader2 className={cn("h-5 w-5 animate-spin", isHighPriority ? "text-white" : "text-primary")} />
          ) : (
            <Checkbox
              checked={isCompleted}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              className={cn("h-5 w-5", isHighPriority && "border-white data-[state=checked]:bg-white data-[state=checked]:text-red-500")}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-row items-center justify-between w-full min-w-0">
          <div className="flex flex-row gap-3 items-center min-w-0 flex-1">
            {/* Recurring badge */}
            {isRecurring && (
              <Repeat className={cn("w-3.5 h-3.5 shrink-0", isHighPriority ? "text-white" : "text-blue-500")} />
            )}

            {/* Title */}
            {editingField === "title" ? (
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveEdit("title")}
                onKeyDown={handleKeyDown}
                className="h-7 text-sm font-medium py-0 px-1"
                maxLength={100}
              />
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h4
                      className={cn(
                        "font-medium text-sm truncate",
                        isCompleted && "line-through text-gray-500",
                        isHighPriority && "text-white",
                        canEdit && !isCompleted && !isHighPriority && "cursor-pointer hover:bg-blue-50 rounded px-1 -mx-1",
                        canEdit && !isCompleted && isHighPriority && "cursor-pointer hover:bg-red-600 rounded px-1 -mx-1",
                      )}
                      onClick={() => startEdit("title")}
                    >
                      {task.title}
                    </h4>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{task.title}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Description */}
            {editingField === "description" ? (
              <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => saveEdit("description")}
                onKeyDown={handleKeyDown}
                className="h-6 text-xs py-0 px-1 max-w-[200px]"
                placeholder="Description..."
              />
            ) : task.description ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        "text-xs truncate",
                        isHighPriority ? "text-white opacity-90" : "text-gray-600",
                        canEdit && !isCompleted && !isHighPriority && "cursor-pointer hover:bg-blue-50 rounded px-1 -mx-1",
                        canEdit && !isCompleted && isHighPriority && "cursor-pointer hover:bg-red-600 rounded px-1 -mx-1",
                      )}
                      onClick={() => startEdit("description")}
                    >
                      {task.description}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs whitespace-pre-wrap">{task.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span
                className={cn(
                  "text-xs truncate",
                  isHighPriority ? "text-white opacity-70" : "text-gray-600",
                  canEdit && !isCompleted && !isHighPriority && "cursor-pointer hover:bg-blue-50 rounded px-1 -mx-1",
                  canEdit && !isCompleted && isHighPriority && "cursor-pointer hover:bg-red-600 rounded px-1 -mx-1",
                  !task.description && canEdit && !isCompleted && !isHighPriority && "text-gray-400 italic",
                )}
                onClick={() => startEdit("description")}
              >
                {canEdit && !isCompleted ? "+" : ""}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {/* Priority */}
            {editingField === "priority" ? (
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => saveEdit("priority", opt.value)}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-transform",
                      opt.color,
                      task.priority === opt.value ? "border-gray-800 scale-125" : "border-transparent",
                    )}
                    title={opt.label}
                  />
                ))}
              </div>
            ) : task.priority !== "medium" ? (
              <button
                className={cn(
                  "flex items-center gap-1 text-xs px-1.5 py-0.5 rounded",
                  canEdit && !isCompleted && !isHighPriority && "cursor-pointer hover:bg-blue-50",
                  canEdit && !isCompleted && isHighPriority && "cursor-pointer hover:bg-red-600",
                )}
                onClick={() => startEdit("priority")}
                disabled={!canEdit || isCompleted}
              >
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    task.priority === "high" && isHighPriority && "bg-white",
                    task.priority === "high" && !isHighPriority && "bg-red-500",
                    task.priority === "medium" && "bg-orange-500",
                    task.priority === "low" && "bg-green-500",
                  )}
                />
                <span className={cn("hidden sm:inline", isHighPriority ? "text-white" : "text-gray-500")}>
                  {TASK_PRIORITY_LABELS[task.priority]}
                </span>
              </button>
            ) : null}

            {/* Due date */}
            {editingField === "dueDate" ? (
              <Input
                ref={inputRef}
                type="date"
                value={editValue}
                onChange={(e) => {
                  setEditValue(e.target.value);
                  saveEdit("dueDate", e.target.value);
                }}
                onBlur={() => cancelEdit()}
                className="h-6 text-xs py-0 px-1 w-[130px]"
              />
            ) : task.dueDate ? (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  isHighPriority ? "text-white opacity-90" : "text-gray-500",
                  canEdit && !isCompleted && !isHighPriority && "cursor-pointer hover:bg-blue-50 rounded px-1",
                  canEdit && !isCompleted && isHighPriority && "cursor-pointer hover:bg-red-600 rounded px-1",
                )}
                onClick={() => startEdit("dueDate")}
              >
                <Calendar className="w-3 h-3" />
                <span>{formatDueDate(task.dueDate)}</span>
              </div>
            ) : canEdit && !isCompleted ? (
              <button
                className={cn(
                  "flex items-center gap-1 text-xs rounded px-1",
                  isHighPriority ? "text-white opacity-70 hover:bg-red-600" : "text-gray-400 hover:bg-blue-50",
                )}
                onClick={() => startEdit("dueDate")}
              >
                <Calendar className="w-3 h-3" />
              </button>
            ) : null}

            {/* Delete button */}
            {showDeleteButton && onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="h-8 w-8 p-0 border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
