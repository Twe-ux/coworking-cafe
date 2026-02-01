import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProduitsPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-9 w-48 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12 mb-2" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Collapsed category cards */}
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3 p-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-8 rounded-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
