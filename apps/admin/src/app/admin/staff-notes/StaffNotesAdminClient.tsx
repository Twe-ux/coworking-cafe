"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Inbox, Trash2 } from "lucide-react";
import { useStaffNotes } from "@/hooks/useStaffNotes";
function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} à ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

export function StaffNotesAdminClient() {
  const [showRead, setShowRead] = useState(false);
  const { notes, isLoading, deleteNote } = useStaffNotes("admin");

  const unreadNotes = notes.filter((n) => !n.isRead);
  const readNotes = notes.filter((n) => n.isRead);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const displayedNotes = showRead ? [...unreadNotes, ...readNotes] : unreadNotes;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {unreadNotes.length} message{unreadNotes.length !== 1 ? "s" : ""} non lu{unreadNotes.length !== 1 ? "s" : ""}
          </span>
          {readNotes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRead((v) => !v)}
              className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50 hover:text-gray-700 h-7 text-xs"
            >
              {showRead ? "Masquer lus" : `Voir lus (${readNotes.length})`}
            </Button>
          )}
        </div>
      </div>

      {displayedNotes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
          <Inbox className="h-12 w-12 opacity-20" />
          <p className="text-sm">Aucun message du staff</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayedNotes.map((note) => (
            <Card key={note.id} className={note.isRead ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {!note.isRead && (
                        <Badge variant="default" className="text-[10px] h-4 px-1.5 bg-blue-500">
                          Nouveau
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-medium text-foreground">
                        — {note.senderName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(note.createdAt)}
                      </span>
                      {note.readAt && (
                        <span className="text-xs text-muted-foreground">
                          Lu le {formatDate(note.readAt)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteNote(note.id)}
                    className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700 shrink-0"
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
