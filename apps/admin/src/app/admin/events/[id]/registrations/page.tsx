"use client";

import { RegistrationsClient } from "./RegistrationsClient";

export default function RegistrationsPage({
  params,
}: {
  params: { id: string };
}) {
  return <RegistrationsClient eventId={params.id} />;
}
