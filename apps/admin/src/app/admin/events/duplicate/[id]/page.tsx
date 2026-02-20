import { DuplicateEventClient } from "./DuplicateEventClient";

interface PageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: "Dupliquer un événement | Admin",
  description: "Dupliquer un événement existant",
};

export default function DuplicateEventPage({ params }: PageProps) {
  return <DuplicateEventClient eventId={params.id} />;
}
