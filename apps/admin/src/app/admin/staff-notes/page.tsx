import { StaffNotesAdminClient } from "./StaffNotesAdminClient";

export default function StaffNotesAdminPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">📝 Notes Staff</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Messages envoyés par le staff à destination de l&apos;administration.
        </p>
      </div>
      <StaffNotesAdminClient />
    </div>
  );
}
