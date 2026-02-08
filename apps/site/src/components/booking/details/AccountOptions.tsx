interface AccountOptionsProps {
  contactForm: {
    createAccount: boolean;
    password: string;
    confirmPassword: string;
    subscribeNewsletter: boolean;
  };
  updateContactField: (field: string, value: string | boolean) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  showConfirmPassword: boolean;
  toggleShowConfirmPassword: () => void;
}

export default function AccountOptions({
  contactForm,
  updateContactField,
  showPassword,
  toggleShowPassword,
  showConfirmPassword,
  toggleShowConfirmPassword,
}: AccountOptionsProps) {
  return (
    <div className="col-md-6">
      <div className="d-flex flex-column h-100">
        <div className="stat-card flex-grow-1">
          <div className="w-100">
            <div className="d-flex align-items-center gap-2 mb-2">
              <i className="bi bi-shield-check text-success"></i>
              <h2 className="h6 mb-0 fw-semibold">Informations compte</h2>
            </div>

            <div className="form-check custom-checkbox mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                id="createAccount"
                checked={contactForm.createAccount}
                onChange={(e) => updateContactField("createAccount", e.target.checked)}
              />
              <label
                className="form-check-label mt-1"
                htmlFor="createAccount"
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "600",
                  color: "var(--main-clr)",
                }}
              >
                Créer un compte client
              </label>
            </div>

            {!contactForm.createAccount && (
              <div
                className="mt-3 mb-3 p-3 rounded"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(242, 211, 129, 0.15) 0%, rgba(65, 121, 114, 0.1) 100%)",
                  border: "2px solid var(--btn-clr)",
                }}
              >
                <h6
                  className="mb-2"
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "700",
                    color: "var(--main-clr)",
                  }}
                >
                  <i className="bi bi-star-fill me-2" style={{ color: "var(--btn-clr)" }}></i>
                  Avantages d'un compte client
                </h6>
                <ul
                  className="mb-0 ps-4"
                  style={{
                    fontSize: "0.85rem",
                    lineHeight: "1.8",
                    color: "var(--gry-clr)",
                  }}
                >
                  <li>Historique de vos réservations</li>
                  <li>Réservations plus rapides (données pré-remplies)</li>
                  <li>Gestion de vos informations personnelles</li>
                  <li>Suivi en temps réel de vos réservations</li>
                  <li>Offres exclusives et promotions</li>
                </ul>
              </div>
            )}

            {contactForm.createAccount && (
              <div className="ms-4 mb-4">
                <div className="mb-4">
                  <label className="form-label small">Mot de passe</label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Minimum 8 caractères"
                      value={contactForm.password}
                      onChange={(e) => updateContactField("password", e.target.value)}
                      required={contactForm.createAccount}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute"
                      onClick={toggleShowPassword}
                      style={{
                        top: "50%",
                        right: "0.5rem",
                        transform: "translateY(-50%)",
                        padding: "0.25rem 0.5rem",
                        color: "#666",
                      }}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small">Confirmer le mot de passe</label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Retapez votre mot de passe"
                      value={contactForm.confirmPassword}
                      onChange={(e) => updateContactField("confirmPassword", e.target.value)}
                      required={contactForm.createAccount}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute"
                      onClick={toggleShowConfirmPassword}
                      style={{
                        top: "50%",
                        right: "0.5rem",
                        transform: "translateY(-50%)",
                        padding: "0.25rem 0.5rem",
                        color: "#666",
                      }}
                    >
                      <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                  {contactForm.createAccount &&
                    contactForm.password &&
                    contactForm.confirmPassword &&
                    contactForm.password !== contactForm.confirmPassword && (
                      <small className="text-danger">
                        Les mots de passe ne correspondent pas
                      </small>
                    )}
                </div>
              </div>
            )}

            <div className="form-check custom-checkbox">
              <input
                type="checkbox"
                className="form-check-input"
                id="newsletter"
                checked={contactForm.subscribeNewsletter}
                onChange={(e) => updateContactField("subscribeNewsletter", e.target.checked)}
              />
              <label
                className="form-check-label"
                htmlFor="newsletter"
                style={{
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  color: "var(--gry-clr)",
                }}
              >
                J'accepte de recevoir la <strong>newsletter</strong> par email, conformément à la
                politique de confidentialité (désinscription possible à tout moment)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
