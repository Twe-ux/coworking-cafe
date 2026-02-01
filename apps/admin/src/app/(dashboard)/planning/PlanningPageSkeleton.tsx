import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PlanningPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with month navigation */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-9 rounded" />
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-9 rounded" />
        </div>
      </div>

      {/* Week cards */}
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
            {/* Day grid */}
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, j) => (
                <div key={j} className="space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-16 w-full rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
