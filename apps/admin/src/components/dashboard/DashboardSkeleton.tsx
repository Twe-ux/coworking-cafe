import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

export function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6 animate-in fade-in duration-500">
      {/* Header Skeleton avec message de chargement intégré */}
      <div className="px-3 md:px-0">
        <div className="mb-2 flex items-center gap-2">
          <Skeleton className="h-8 w-64" />
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
        <Skeleton className="h-4 w-[28rem] max-w-full" />
      </div>

      {/* Toggle Skeleton */}
      <div className="flex items-center justify-end px-3 md:px-0">
        <Skeleton className="h-10 w-32 rounded-full" />
      </div>

      {/* Cards Skeleton - Structure identique aux vraies cartes */}
      <div className="grid gap-3 px-3 md:gap-4 md:px-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="w-full min-w-0 animate-in fade-in duration-700"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <div className="h-4 w-32 rounded-md bg-muted/80" />
                <div className="h-6 w-16 rounded-full bg-muted/60" />
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-baseline gap-2">
                <div className="h-8 w-32 rounded-md bg-muted/80" />
                <div className="h-3 w-8 rounded bg-muted/60" />
              </div>
              <div className="mt-1 h-3 w-40 rounded bg-muted/60" />
            </CardContent>
            <CardFooter className="pt-0">
              <div className="h-3 w-28 rounded bg-muted/60" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="px-3 md:px-0">
        <Card className="p-6 animate-in fade-in duration-700" style={{ animationDelay: "500ms" }}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
              <Skeleton className="h-10 w-40 rounded-md" />
            </div>
            <Skeleton className="h-[400px] w-full" />
          </div>
        </Card>
      </div>
    </div>
  );
}
