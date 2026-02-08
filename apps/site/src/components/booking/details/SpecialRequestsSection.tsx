interface SpecialRequestsSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SpecialRequestsSection({
  value,
  onChange,
}: SpecialRequestsSectionProps) {
  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-2">
        <i className="bi bi-chat-left-text text-success"></i>
        <label className="form-label mb-0 fw-semibold">
          Demandes particulières{" "}
          <span className="text-muted fw-normal">(optionnel)</span>
        </label>
      </div>
      <textarea
        className="form-control"
        rows={4}
        placeholder="Équipements spéciaux, allergies alimentaires, préférences d'ambiance, etc."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
