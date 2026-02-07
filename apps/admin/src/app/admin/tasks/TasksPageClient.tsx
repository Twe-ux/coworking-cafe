"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ListTodo, CheckCircle2 } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
import { useTasks } from "@/hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";

interface TasksPageClientProps {
  userRole: string;
  canCreate: boolean;
}

type TaskTabValue = "pending" | "completed";

export function TasksPageClient({ userRole, canCreate }: TasksPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskTabValue>("pending");

  const {
    tasks: pendingTasks,
    loading: loadingPending,
    createTask,
    toggleTaskStatus: togglePending,
    deleteTask: deletePending,
  } = useTasks({ status: "pending" });

  const {
    tasks: completedTasks,
    loading: loadingCompleted,
    toggleTaskStatus: toggleCompleted,
    deleteTask: deleteCompleted,
  } = useTasks({ status: "completed" });

  const handleCreateTask = async (data: Parameters<typeof createTask>[0]) => {
    await createTask(data);
  };

  const handleToggle =
    activeTab === "pending" ? togglePending : toggleCompleted;
  const handleDelete = activeTab === "pending" ? deletePending : deleteCompleted;

  const loading = activeTab === "pending" ? loadingPending : loadingCompleted;
  const tasks = activeTab === "pending" ? pendingTasks : completedTasks;

  // Seuls dev et admin peuvent supprimer
  const canDelete = ["dev", "admin"].includes(userRole);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tâches</h1>
          <p className="text-muted-foreground mt-2">
            Gérez les tâches de l'équipe
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Créer une tâche
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TaskTabValue)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            À faire
            {pendingTasks.length > 0 && (
              <span className="ml-1 text-xs">({pendingTasks.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Complétées
            {completedTasks.length > 0 && (
              <span className="ml-1 text-xs">({completedTasks.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Contenu : À faire */}
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tâches à faire</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  onToggle={handleToggle}
                  onDelete={canDelete ? handleDelete : undefined}
                  showDeleteButton={canDelete}
                  emptyMessage="Aucune tâche à faire ! 🎉"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contenu : Complétées */}
        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tâches complétées</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <TaskList
                  tasks={tasks}
                  onToggle={handleToggle}
                  onDelete={canDelete ? handleDelete : undefined}
                  showDeleteButton={canDelete}
                  emptyMessage="Aucune tâche complétée"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal création */}
      {canCreate && (
        <TaskCreateModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          onSubmit={handleCreateTask}
        />
      )}
    </div>
  );
}
