"use client";

import { TaskItem } from "./TaskItem";
import type { Task } from "@/types/task";

interface TaskListProps {
  tasks: Task[];
  onToggle: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  showDeleteButton?: boolean;
  emptyMessage?: string;
}

export function TaskList({
  tasks,
  onToggle,
  onDelete,
  showDeleteButton = false,
  emptyMessage = "Aucune tâche",
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onDelete={onDelete}
          showDeleteButton={showDeleteButton}
        />
      ))}
    </div>
  );
}
