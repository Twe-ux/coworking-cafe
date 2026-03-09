"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckSquare, Plus, ArrowRight, ListTodo } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
import { DLCStockCountForm } from "@/components/tasks/DLCStockCountForm";
import { useTasks } from "@/hooks/useTasks";
import { useRole } from "@/hooks/useRole";
import { Skeleton } from "@/components/ui/skeleton";
import type { Task } from "@/types/task";

/**
 * Card affichant les tâches à faire aujourd'hui
 * Affiche les 5 premières tâches pending
 */
export function TodayTasksCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const [dlcModalOpen, setDlcModalOpen] = useState(false);
  const [selectedDLCTask, setSelectedDLCTask] = useState<Task | null>(null);
  const { isDev, isAdmin } = useRole();
  const { tasks, loading, error, createTask, toggleTaskStatus, refetch } =
    useTasks({
      status: "pending",
    });

  // Seuls dev et admin peuvent créer des tâches
  const canCreate = isDev || isAdmin;

  // Limiter à 5 tâches pour le dashboard
  const displayedTasks = tasks.slice(0, 5);
  const hasMoreTasks = tasks.length > 5;

  const handleCreateTask = async (data: Parameters<typeof createTask>[0]) => {
    await createTask(data);
  };

  const handleTaskClick = (task: Task) => {
    // Check if it's a DLC stock count task
    if (
      task.metadata &&
      typeof task.metadata === "object" &&
      "type" in task.metadata &&
      task.metadata.type === "dlc_stock_count"
    ) {
      setSelectedDLCTask(task);
      setDlcModalOpen(true);
    }
  };

  const handleDLCComplete = () => {
    setDlcModalOpen(false);
    setSelectedDLCTask(null);
    refetch(); // Refresh tasks after completion
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <CheckSquare className="h-5 w-5" />
              Tâches à faire
            </span>
            <Skeleton className="h-9 w-9" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="h-5 w-5" />
            Tâches à faire
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
            <p className="text-sm text-red-500">Erreur: {error}</p>
            <p className="text-xs mt-1">Impossible de charger les tâches</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-lg">
              <CheckSquare className="h-5 w-5" />
              Tâches à faire
              {tasks.length > 0 && (
                <span className="text-sm font-normal text-muted-foreground">
                  ({tasks.length})
                </span>
              )}
            </span>
            {canCreate && (
              <Button
                variant="outline"
                className="border-green-500 text-green-600 hover:bg-green-100 hover:text-green-700 px-4"
                size="sm"
                onClick={() => setModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Créer
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {displayedTasks.length === 0 ? (
            <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
              <ListTodo className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">Aucune tâche en cours</p>
              <p className="text-xs mt-1">Créez une tâche pour commencer</p>
            </div>
          ) : (
            <>
              <TaskList
                tasks={displayedTasks}
                onToggle={toggleTaskStatus}
                onTaskClick={handleTaskClick}
                emptyMessage="Aucune tâche"
              />

              {hasMoreTasks && (
                <div className="mt-4 pt-4 border-t">
                  <Link href="/admin/tasks">
                    <Button variant="outline" size="sm" className="w-full border-gray-300 text-gray-700 hover:border-green-500 hover:bg-green-50 hover:text-green-700">
                      Voir toutes les tâches ({tasks.length})
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {canCreate && (
        <TaskCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={handleCreateTask}
        />
      )}

      {selectedDLCTask && (
        <Dialog open={dlcModalOpen} onOpenChange={setDlcModalOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedDLCTask.title}</DialogTitle>
            </DialogHeader>
            <DLCStockCountForm
              taskId={selectedDLCTask.id}
              productIds={
                (selectedDLCTask.metadata as { productIds?: string[] })
                  ?.productIds || []
              }
              onComplete={handleDLCComplete}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
