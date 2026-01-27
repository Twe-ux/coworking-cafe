import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ReservationsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-48" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List Header */}
      <CardHeader className="px-0">
        <Skeleton className="h-6 w-48" />
      </CardHeader>

      {/* List Items */}
      <CardContent className="space-y-3 p-0">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-l-4 border-l-gray-200">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between">
                {/* Colonnes alignées */}
                <div className="flex items-center text-sm">
                  <div className="w-[100px]"><Skeleton className="h-5 w-20" /></div>
                  <div className="w-[100px]"><Skeleton className="h-5 w-16 rounded-full" /></div>
                  <div className="w-[175px]"><Skeleton className="h-5 w-32" /></div>
                  <div className="w-[100px]"><Skeleton className="h-5 w-14 rounded-full" /></div>
                  <div className="w-[110px]"><Skeleton className="h-4 w-20" /></div>
                  <div className="w-[120px]"><Skeleton className="h-4 w-24" /></div>
                  <div className="w-[70px]"><Skeleton className="h-4 w-8" /></div>
                </div>
                {/* Prix + Boutons */}
                <div className="flex items-center gap-3">
                  <Skeleton className="h-5 w-[80px]" />
                  <div className="flex gap-1 w-[72px] justify-end">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </div>
  )
}
