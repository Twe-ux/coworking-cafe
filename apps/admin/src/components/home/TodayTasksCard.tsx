"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Plus, ArrowRight, ListTodo } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
import { useTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Card affichant les tâches à faire aujourd'hui
 * Affiche les 5 premières tâches pending
 */
export function TodayTasksCard() {
  const [modalOpen, setModalOpen] = useState(false);
  const { tasks, loading, createTask, toggleTaskStatus } = useTasks({
    status: "pending",
  });

  // Limiter à 5 tâches pour le dashboard
  const displayedTasks = tasks.slice(0, 5);
  const hasMoreTasks = tasks.length > 5;

  const handleCreateTask = async (data: Parameters<typeof createTask>[0]) => {
    await createTask(data);
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
            <Button size="sm" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Créer
            </Button>
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
                emptyMessage="Aucune tâche"
              />

              {hasMoreTasks && (
                <div className="mt-4 pt-4 border-t">
                  <Link href="/admin/tasks">
                    <Button variant="ghost" size="sm" className="w-full">
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

      <TaskCreateModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateTask}
      />
    </>
  );
}
