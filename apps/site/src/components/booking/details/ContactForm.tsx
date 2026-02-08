interface ContactFormProps {
  isLoggedIn: boolean;
  contactForm: {
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    contactCompanyName: string;
  };
  updateContactField: (field: string, value: string) => void;
}

export default function ContactForm({
  isLoggedIn,
  contactForm,
  updateContactField,
}: ContactFormProps) {
  return (
    <div className={isLoggedIn ? "col-12 mb-4 mb-md-0" : "col-md-6 mb-4 mb-md-0"}>
      <div className="stat-card h-100">
        <div className="w-100">
          <div className="d-flex align-items-center gap-2 mb-4">
            <i className="bi bi-person-lines-fill text-success"></i>
            <h2 className="h6 mb-0 fw-semibold">Coordonnées</h2>
          </div>

          {isLoggedIn ? (
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Nom complet <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Votre nom complet"
                  value={contactForm.contactName}
                  onChange={(e) => updateContactField("contactName", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="vous@email.com"
                  value={contactForm.contactEmail}
                  onChange={(e) => updateContactField("contactEmail", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-0">
                <label className="form-label">
                  Téléphone <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="06 XX XX XX XX"
                  value={contactForm.contactPhone}
                  onChange={(e) => updateContactField("contactPhone", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-0">
                <label className="form-label">
                  Raison sociale <span className="text-muted">(optionnel)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom de votre société"
                  value={contactForm.contactCompanyName}
                  onChange={(e) => updateContactField("contactCompanyName", e.target.value)}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mb-3">
                <label className="form-label">
                  Nom complet <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Votre nom complet"
                  value={contactForm.contactName}
                  onChange={(e) => updateContactField("contactName", e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="vous@email.com"
                  value={contactForm.contactEmail}
                  onChange={(e) => updateContactField("contactEmail", e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Téléphone <span className="text-danger">*</span>
                </label>
                <input
                  type="tel"
                  className="form-control"
                  placeholder="06 XX XX XX XX"
                  value={contactForm.contactPhone}
                  onChange={(e) => updateContactField("contactPhone", e.target.value)}
                  required
                />
              </div>

              <div className="mb-0">
                <label className="form-label">
                  Raison sociale <span className="text-muted">(optionnel)</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom de votre société"
                  value={contactForm.contactCompanyName}
                  onChange={(e) => updateContactField("contactCompanyName", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
