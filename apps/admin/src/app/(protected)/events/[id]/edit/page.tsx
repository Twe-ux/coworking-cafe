"use client";

import { EditEventClient } from "./EditEventClient";

export default function EditEventPage({ params }: { params: { id: string } }) {
  return <EditEventClient eventId={params.id} />;
}
