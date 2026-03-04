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
import { Edit, Trash2, Eye, EyeOff, Copy, Archive, Users } from "lucide-react";
import type { EventStatus } from "@coworking-cafe/database";
import Image from "next/image";
import Link from "next/link";

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
  cancelled: "bg-red-500",
};

const statusLabels: Record<EventStatus, string> = {
  draft: "Brouillon",
  published: "Publié",
  archived: "Archivé",
  cancelled: "Annulé",
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
                    <Badge key={cat} variant="outline" className="text-xs border-blue-500 bg-blue-50 text-blue-700 pointer-events-none">
                      {cat}
                    </Badge>
                  ))}
                  {event.category.length > 2 && (
                    <Badge variant="outline" className="text-xs border-blue-500 bg-blue-50 text-blue-700 pointer-events-none">
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
                    <Link
                      href={`/admin/events/${event._id}/registrations`}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Users className="h-3 w-3" />
                      {event.currentParticipants || 0}
                      {event.maxParticipants && `/${event.maxParticipants}`}
                    </Link>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Externe</div>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50 hover:text-gray-700"
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
                    variant="outline"
                    size="sm"
                    className="border-blue-500 text-blue-700 hover:bg-blue-50 hover:text-blue-700"
                    onClick={() => onEdit(event._id)}
                    title="Modifier"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-500 text-orange-700 hover:bg-orange-50 hover:text-orange-700"
                    onClick={() => onDuplicate(event._id)}
                    title="Dupliquer"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {event.status !== "archived" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-300 text-gray-700 hover:border-gray-500 hover:bg-gray-50 hover:text-gray-700"
                      onClick={() => onArchive(event._id)}
                      title="Archiver"
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500 text-red-700 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onDelete(event)}
                    title="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
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
