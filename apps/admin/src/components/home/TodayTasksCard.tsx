import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, ListTodo } from "lucide-react";

/**
 * Card affichant les tâches à faire aujourd'hui
 * Placeholder pour future implémentation
 */
export function TodayTasksCard() {
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
          <ListTodo className="h-12 w-12 mb-3 opacity-50" />
          <p className="text-sm">Aucune tâche aujourd'hui</p>
          <p className="text-xs mt-1">Les tâches s'afficheront ici</p>
        </div>
      </CardContent>
    </Card>
  );
}
