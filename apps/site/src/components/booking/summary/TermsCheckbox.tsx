"use client";

interface TermsCheckboxProps {
  acceptedTerms: boolean;
  onAcceptedTermsChange: (accepted: boolean) => void;
}

export default function TermsCheckbox({
  acceptedTerms,
  onAcceptedTermsChange,
}: TermsCheckboxProps) {
  return (
    <div
      style={{
        padding: "1.25rem",
        background: acceptedTerms
          ? "linear-gradient(135deg, #e6f7f5 0%, #d1f0eb 100%)"
          : "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
        borderRadius: "10px",
        border: acceptedTerms ? "2px solid #588983" : "2px solid #d1d5db",
        marginBottom: "1.25rem",
        boxShadow: acceptedTerms
          ? "0 2px 8px rgba(88, 137, 131, 0.15)"
          : "0 1px 3px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.875rem",
        }}
      >
        <input
          type="checkbox"
          id="acceptTerms"
          checked={acceptedTerms}
          onChange={(e) => {
            onAcceptedTermsChange(e.target.checked);
            sessionStorage.setItem("acceptedTerms", e.target.checked.toString());
          }}
          style={{
            width: "1.35rem",
            height: "1.35rem",
            minWidth: "1.35rem",
            marginTop: "0.15rem",
            cursor: "pointer",
            accentColor: "#588983",
            flexShrink: 0,
          }}
        />
        <label
          htmlFor="acceptTerms"
          style={{
            fontSize: "0.95rem",
            fontWeight: "500",
            color: "#374151",
            cursor: "pointer",
            lineHeight: "1.6",
            flex: 1,
          }}
        >
          J'accepte les{" "}
          <a
            href="/cgu"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#588983",
              textDecoration: "underline",
              fontWeight: "600",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#417972")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#588983")}
          >
            conditions générales de vente
          </a>
        </label>
      </div>
    </div>
  );
}
