"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StyledAlert } from "@/components/ui/styled-alert";
import { ArrowLeft, X } from "lucide-react";
import { EventForm } from "@/components/events/EventForm";
import type { EventFormData } from "@/components/events/EventForm";
import { Skeleton } from "@/components/ui/skeleton";

interface EditEventClientProps {
  eventId: string;
}

export function EditEventClient({ eventId }: EditEventClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState<EventFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const result = await response.json();

        if (result.success) {
          setInitialData(result.data);
        } else {
          setMessage({
            type: "error",
            text: result.error || "Événement introuvable",
          });
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: "Erreur lors du chargement de l'événement",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      setMessage(null);

      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({
          type: "success",
          text: "Événement modifié avec succès !",
        });

        // Redirect to events list after 1.5 seconds
        setTimeout(() => {
          router.push("/events");
        }, 1500);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erreur lors de la modification",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Erreur lors de la modification de l'événement",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/events");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-24" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-60" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!initialData) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <StyledAlert variant="destructive">
          Événement introuvable
        </StyledAlert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Modifier l'événement</h1>
          <p className="text-muted-foreground">{initialData.title}</p>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="relative">
          <StyledAlert variant={message.type === "success" ? "success" : "destructive"}>
            {message.text}
          </StyledAlert>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => setMessage(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Form */}
      <EventForm
        initialData={initialData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
