import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ArticlesSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-9 w-48" /> {/* Titre */}
        <Skeleton className="h-10 w-[180px]" /> {/* Bouton Nouvel article */}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-[200px]" /> {/* Select status */}
        <Skeleton className="h-10 w-[200px]" /> {/* Select category */}
        <Skeleton className="h-10 flex-1" /> {/* Search input */}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

      {/* Table */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0">
              <Skeleton className="h-16 w-24 rounded" /> {/* Image */}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-64" /> {/* Title */}
                <Skeleton className="h-4 w-96" /> {/* Excerpt */}
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" /> {/* Badge */}
                  <Skeleton className="h-5 w-20" /> {/* Category */}
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-9 w-20" /> {/* Button */}
                <Skeleton className="h-9 w-20" /> {/* Button */}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  )
}
