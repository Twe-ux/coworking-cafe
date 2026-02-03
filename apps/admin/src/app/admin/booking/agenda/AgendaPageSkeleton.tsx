import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AgendaPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-48 mt-2" />
      </div>

      {/* Legend */}
      <div className="flex gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <Card>
        <CardContent className="p-4">
          {/* Month header */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-9 rounded" />
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-8 w-9 rounded" />
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
          {/* Calendar cells */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="grid grid-cols-7 gap-1 mb-1">
              {[...Array(7)].map((_, j) => (
                <Skeleton key={j} className="h-[129px] w-full rounded" />
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
