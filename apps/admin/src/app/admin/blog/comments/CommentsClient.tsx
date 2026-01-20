"use client"

import { useState } from "react"
import { useComments } from "@/hooks/useComments"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MessagesSquare, Check, X, Trash2 } from "lucide-react"
import type { CommentStatus } from "@/types/blog"

export function CommentsClient() {
  const [status, setStatus] = useState<CommentStatus | "all">("pending")

  const { comments, loading, error, updateComment, deleteComment } = useComments({
    status,
    limit: 20,
  })

  if (loading) {
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

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">Erreur: {error}</div>
      </div>
    )
  }

  const handleApprove = async (id: string) => {
    await updateComment(id, { status: "approved" })
  }

  const handleReject = async (id: string) => {
    await updateComment(id, { status: "rejected" })
  }

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      await deleteComment(id)
    }
  }

  const statusColors: Record<CommentStatus, string> = {
    pending: "outline",
    approved: "default",
    rejected: "destructive",
    spam: "secondary",
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessagesSquare className="w-8 h-8" />
          Commentaires
        </h1>
        <Select value={status} onValueChange={(v) => setStatus(v as CommentStatus | "all")}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="pending">En attente</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="rejected">Rejetés</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des commentaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Aucun commentaire trouvé
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment._id}
                className="flex items-start gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">
                      {comment.user?.name || "Utilisateur"}
                    </span>
                    <Badge variant={statusColors[comment.status] as never}>
                      {comment.status}
                    </Badge>
                  </div>
                  <p className="text-sm mb-2">{comment.content}</p>
                  {comment.article && (
                    <p className="text-xs text-muted-foreground">
                      Sur l'article: {comment.article.title}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  {comment.status === "pending" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApprove(comment._id || "")}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReject(comment._id || "")}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(comment._id || "")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
