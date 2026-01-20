"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ArticlesClient } from "./ArticlesClient"
import { ArticlesSkeleton } from "./ArticlesSkeleton"

export default function ArticlesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const userRole = session?.user?.role
    if (session && userRole && !["dev", "admin", "staff"].includes(userRole)) {
      router.push("/403")
    }
  }, [session, router])

  if (status === "loading" || !session) {
    return <ArticlesSkeleton />
  }

  return <ArticlesClient />
}
