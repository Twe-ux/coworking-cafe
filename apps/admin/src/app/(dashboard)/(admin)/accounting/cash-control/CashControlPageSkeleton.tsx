import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CashControlPageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />

            {/* Filtres */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-9 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-9 w-32" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Table header */}
          <div className="grid grid-cols-6 gap-4 border-b pb-3 mb-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>

          {/* Table rows */}
          <div className="space-y-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 py-2">
                {[...Array(6)].map((_, j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
