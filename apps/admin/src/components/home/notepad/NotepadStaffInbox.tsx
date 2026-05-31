"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Inbox } from "lucide-react";
import { useStaffNotes } from "@/hooks/useStaffNotes";

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  } catch {
    return iso;
  }
}

export function NotepadStaffInbox() {
  const { notes, isLoading, markRead } = useStaffNotes("staff");

  if (isLoading) {
    return (
      <div className="space-y-2 pt-1">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
        <Inbox className="h-8 w-8 opacity-30" />
        <p className="text-xs">Aucun message non lu</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-56 overflow-y-auto pr-1 pt-1">
      {notes.map((note) => (
        <div
          key={note.id}
          className="flex items-start gap-3 p-2.5 rounded-md border bg-muted/40 hover:bg-muted/60 transition-colors"
        >
          <Checkbox
            id={`note-${note.id}`}
            onCheckedChange={() => markRead(note.id)}
            className="mt-0.5 shrink-0"
            title="Marquer comme lu"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{note.content}</p>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                {formatDate(note.createdAt)}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">— {note.senderName}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
