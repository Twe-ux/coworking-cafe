"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { StyledAlert } from "@/components/ui/styled-alert";
import { ArrowLeft, X } from "lucide-react";
import { EventForm } from "@/components/events/EventForm";
import type { EventFormData } from "@/components/events/EventForm";

interface DuplicateEventClientProps {
  eventId: string;
}

export function DuplicateEventClient({ eventId }: DuplicateEventClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventFormData | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Load event data
  useEffect(() => {
    async function loadEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        const result = await response.json();

        if (result.success) {
          const event = result.data;

          // Prepare data for duplication (remove slug to force auto-generation)
          const duplicateData: EventFormData = {
            title: event.title,
            slug: "", // Will be auto-generated from title + date
            description: event.description,
            shortDescription: event.shortDescription || "",
            date: event.date,
            startTime: event.startTime || "",
            endTime: event.endTime || "",
            category: event.category,
            imgSrc: event.imgSrc,
            imgAlt: event.imgAlt,
            location: event.location || "",
            registrationType: event.registrationType,
            externalLink: event.externalLink || "",
            maxParticipants: event.maxParticipants,
            price: event.price,
            organizer: event.organizer || "",
            contactEmail: event.contactEmail || "",
            status: "draft", // Always start as draft
          };

          setEventData(duplicateData);
        } else {
          setMessage({
            type: "error",
            text: "Événement introuvable",
          });
        }
      } catch (error) {
        console.error("Error loading event:", error);
        setMessage({
          type: "error",
          text: "Erreur lors du chargement de l'événement",
        });
      } finally {
        setLoading(false);
      }
    }

    loadEvent();
  }, [eventId]);

  const handleSubmit = async (data: EventFormData) => {
    try {
      setIsSubmitting(true);
      setMessage(null);

      console.log("📤 Données envoyées à l'API:", data);

      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      console.log("📥 Réponse HTTP:", response.status, response.statusText);

      const result = await response.json();
      console.log("📥 Résultat API:", result);

      if (result.success) {
        setMessage({
          type: "success",
          text: "Événement dupliqué avec succès !",
        });

        // Redirect to events list after 1.5 seconds
        setTimeout(() => {
          router.push("/admin/events");
        }, 1500);
      } else {
        console.error("❌ Erreur API:", result);
        setMessage({
          type: "error",
          text: result.error || "Erreur lors de la duplication",
        });
      }
    } catch (error) {
      console.error("❌ Exception:", error);
      setMessage({
        type: "error",
        text: "Erreur lors de la duplication de l'événement",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/events");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="space-y-6">
        <StyledAlert variant="destructive">
          Événement introuvable
        </StyledAlert>
        <Button onClick={handleCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
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
          <h1 className="text-3xl font-bold">Dupliquer un événement</h1>
          <p className="text-muted-foreground">
            Créer un nouvel événement basé sur un événement existant
          </p>
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
        initialData={eventData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
