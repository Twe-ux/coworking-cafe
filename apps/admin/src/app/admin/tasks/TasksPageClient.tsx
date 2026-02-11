"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, ListTodo, CheckCircle2, Repeat } from "lucide-react";
import { TaskList } from "@/components/tasks/TaskList";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
import { RecurringTasksManager } from "@/components/tasks/RecurringTasksManager";
import { useTasks } from "@/hooks/useTasks";
import { useRecurringTasks } from "@/hooks/useRecurringTasks";
import { Skeleton } from "@/components/ui/skeleton";

interface TasksPageClientProps {
  userRole: string;
  canCreate: boolean;
}

type TaskTabValue = "pending" | "completed";

export function TasksPageClient({ userRole, canCreate }: TasksPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [recurringManagerOpen, setRecurringManagerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TaskTabValue>("pending");

  const canEdit = ["dev", "admin"].includes(userRole);
  const canDelete = ["dev", "admin"].includes(userRole);

  const {
    tasks: pendingTasks,
    loading: loadingPending,
    createTask,
    updateTask: updatePending,
    toggleTaskStatus: togglePending,
    deleteTask: deletePending,
    refetch: refetchPending,
  } = useTasks({ status: "pending" });

  const {
    tasks: completedTasks,
    loading: loadingCompleted,
    updateTask: updateCompleted,
    toggleTaskStatus: toggleCompleted,
    deleteTask: deleteCompleted,
  } = useTasks({ status: "completed" });

  const {
    templates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    syncRecurring,
  } = useRecurringTasks();

  const handleCreateTask = async (data: Parameters<typeof createTask>[0]) => {
    await createTask(data);
  };

  const handleCreateRecurring = async (
    data: Parameters<typeof createTemplate>[0]
  ) => {
    await createTemplate(data);
    // Sync to create today's instances if applicable
    await syncRecurring();
    await refetchPending();
  };

  const handleDeleteTemplate = async (id: string) => {
    await deleteTemplate(id);
    await refetchPending();
  };

  const handleToggle =
    activeTab === "pending" ? togglePending : toggleCompleted;
  const handleDelete = activeTab === "pending" ? deletePending : deleteCompleted;
  const handleUpdate = activeTab === "pending" ? updatePending : updateCompleted;

  const loading = activeTab === "pending" ? loadingPending : loadingCompleted;
  const tasks = activeTab === "pending" ? pendingTasks : completedTasks;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Taches</h1>
          <p className="text-muted-foreground mt-2">
            Gerez les taches de l&apos;equipe
          </p>
        </div>
        <div className="flex items-center gap-2">
          {canCreate && (
            <>
              <Button
                variant="outline"
                onClick={() => setRecurringManagerOpen(true)}
              >
                <Repeat className="h-4 w-4 mr-2" />
                Recurrentes
                {templates.length > 0 && (
                  <span className="ml-1 text-xs">({templates.length})</span>
                )}
              </Button>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Creer une tache
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TaskTabValue)}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            A faire
            {pendingTasks.length > 0 && (
              <span className="ml-1 text-xs">({pendingTasks.length})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Completees
            {completedTasks.length > 0 && (
              <span className="ml-1 text-xs">({completedTasks.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Pending */}
        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Taches a faire</CardTitle>
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
                  onUpdate={canEdit ? handleUpdate : undefined}
                  onDelete={canDelete ? handleDelete : undefined}
                  showDeleteButton={canDelete}
                  canEdit={canEdit}
                  emptyMessage="Aucune tache a faire ! 🎉"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Completed */}
        <TabsContent value="completed" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Taches completees</CardTitle>
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
                  onUpdate={canEdit ? handleUpdate : undefined}
                  onDelete={canDelete ? handleDelete : undefined}
                  showDeleteButton={canDelete}
                  canEdit={canEdit}
                  emptyMessage="Aucune tache completee"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create modal */}
      {canCreate && (
        <>
          <TaskCreateModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            onSubmit={handleCreateTask}
            onSubmitRecurring={handleCreateRecurring}
          />
          <RecurringTasksManager
            open={recurringManagerOpen}
            onOpenChange={setRecurringManagerOpen}
            templates={templates}
            onUpdate={updateTemplate}
            onDelete={handleDeleteTemplate}
          />
        </>
      )}
    </div>
  );
}
