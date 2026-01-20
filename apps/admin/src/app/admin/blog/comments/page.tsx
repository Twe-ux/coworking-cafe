"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { CommentsClient } from "./CommentsClient"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

function CommentsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <Skeleton className="h-9 w-48" />
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default function CommentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const userRole = session?.user?.role
    if (session && userRole && !["dev", "admin"].includes(userRole)) {
      router.push("/403")
    }
  }, [session, router])

  if (status === "loading" || !session) {
    return <CommentsSkeleton />
  }

  return <CommentsClient />
}
