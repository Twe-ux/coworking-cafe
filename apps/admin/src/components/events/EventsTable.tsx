"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Eye, EyeOff, Copy, Archive } from "lucide-react";
import type { EventStatus } from "@coworking-cafe/database";
import Image from "next/image";

interface EventItem {
  _id: string;
  title: string;
  slug: string;
  date: string;
  startTime?: string;
  category: string[];
  imgSrc: string;
  status: EventStatus;
  registrationType: "internal" | "external";
  maxParticipants?: number;
  currentParticipants?: number;
  createdBy?: {
    givenName?: string;
    familyName?: string;
  };
  createdAt: string;
}

interface EventsTableProps {
  events: EventItem[];
  loading: boolean;
  onEdit: (eventId: string) => void;
  onDuplicate: (eventId: string) => void;
  onArchive: (eventId: string) => void;
  onDelete: (event: EventItem) => void;
  onStatusToggle: (eventId: string, currentStatus: EventStatus) => void;
}

const statusColors: Record<EventStatus, string> = {
  draft: "bg-gray-500",
  published: "bg-green-500",
  archived: "bg-orange-500",
};

const statusLabels: Record<EventStatus, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
};

export function EventsTable({
  events,
  loading,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onStatusToggle,
}: EventsTableProps) {
  if (events.length === 0 && !loading) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/50">
        <p className="text-muted-foreground">Aucun événement trouvé</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">Image</TableHead>
            <TableHead>Titre</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Catégories</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Inscription</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event._id}>
              <TableCell>
                <Image
                  src={event.imgSrc}
                  alt={event.title}
                  width={60}
                  height={45}
                  className="rounded object-cover"
                />
              </TableCell>
              <TableCell className="font-medium">
                <div>
                  <div>{event.title}</div>
                  <div className="text-xs text-muted-foreground">/{event.slug}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div>{new Date(event.date).toLocaleDateString("fr-FR")}</div>
                  {event.startTime && (
                    <div className="text-xs text-muted-foreground">{event.startTime}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {event.category.slice(0, 2).map((cat) => (
                    <Badge key={cat} variant="secondary" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                  {event.category.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{event.category.length - 2}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[event.status]}>
                  {statusLabels[event.status]}
                </Badge>
              </TableCell>
              <TableCell>
                {event.registrationType === "internal" ? (
                  <div className="text-sm">
                    <div>Interne</div>
                    {event.maxParticipants && (
                      <div className="text-xs text-muted-foreground">
                        {event.currentParticipants || 0}/{event.maxParticipants}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm">Externe</div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStatusToggle(event._id, event.status)}
                    title={
                      event.status === "published"
                        ? "Mettre en brouillon"
                        : "Publier"
                    }
                  >
                    {event.status === "published" ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(event._id)}
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicate(event._id)}
                    title="Dupliquer"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {event.status !== "archived" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onArchive(event._id)}
                      title="Archiver"
                    >
                      <Archive className="h-4 w-4 text-orange-500" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(event)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
