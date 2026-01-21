import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { options } from "../../../../lib/auth-options";
import Link from "next/link";
import dbConnect from "../../../../lib/mongodb";
import { User } from "../../../../models/user";
import SettingsClient from "./SettingsClient";
import "../profile/profile.scss";

// Force dynamic rendering - don't pre-render at build time
export const dynamic = "force-dynamic";

interface SettingsPageProps {
  params: { id: string };
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const session = await getServerSession(options);

  // Check if user is authenticated
  if (!session) {
    redirect(`/auth/login?callbackUrl=/${params.id}/settings`);
  }

  // Check if user has a username
  if (!session.user.username) {
    redirect("/auth/login");
  }

  // Security check: verify the URL username matches the logged-in user
  if (params.id !== session.user.username) {
    // Redirect to their own settings
    redirect(`/${session.user.username}/settings`);
  }

  const username = session.user.username;

  // Fetch user's current newsletter preference
  await dbConnect();
  const user = await User.findOne({ email: session.user.email }).select(
    "newsletter",
  );
  const newsletterSubscribed = user?.newsletter ?? false;

  return (
    <section className="client-dashboard py__130">
      <div className="container">
        {/* Welcome Card */}
        <div className="welcome-card">
          <h1 className="welcome-title">Paramètres</h1>
          <p className="welcome-text">
            Personnalisez votre expérience et gérez vos préférences
          </p>
        </div>

        <div className="row">
          <div className="col-lg-8">
            {/* Notification Settings */}
            <div className="mb-4">
              <h2 className="section-title">Notifications</h2>
            </div>
            <div
              className="card shadow-sm border-0 mb-4"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-4">
                <SettingsClient initialNewsletter={newsletterSubscribed} />

                <div className="mb-3 form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="emailNotifications"
                    defaultChecked
                    disabled
                  />
                  <label
                    className="form-check-label text-muted"
                    htmlFor="emailNotifications"
                  >
                    Recevoir les notifications par email (bientôt disponible)
                  </label>
                </div>

                <div className="mb-3 form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="reservationReminders"
                    defaultChecked
                    disabled
                  />
                  <label
                    className="form-check-label text-muted"
                    htmlFor="reservationReminders"
                  >
                    Rappels de réservation (bientôt disponible)
                  </label>
                </div>

                <div className="mb-3 form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="promotionalEmails"
                    disabled
                  />
                  <label
                    className="form-check-label text-muted"
                    htmlFor="promotionalEmails"
                  >
                    Recevoir les offres promotionnelles (bientôt disponible)
                  </label>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="mb-4">
              <h2 className="section-title">Confidentialité</h2>
              <span
                className="badge ms-3"
                style={{
                  backgroundColor: "#f2d381",
                  color: "#142220",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                }}
              >
                Bientôt disponible
              </span>
            </div>
            <div
              className="card shadow-sm border-0 mb-4"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-4">
                <div className="mb-3 form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="profilePublic"
                    disabled
                  />
                  <label
                    className="form-check-label text-muted"
                    htmlFor="profilePublic"
                  >
                    Profil public
                  </label>
                  <small className="d-block text-muted">
                    Permettre aux autres utilisateurs de voir votre profil
                  </small>
                </div>

                <div className="mb-3 form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showEmail"
                    disabled
                  />
                  <label
                    className="form-check-label text-muted"
                    htmlFor="showEmail"
                  >
                    Afficher mon email
                  </label>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mb-4">
              <h2
                className="section-title"
                style={{ borderBottomColor: "#dc3545", color: "#dc3545" }}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                Zone de danger
              </h2>
            </div>
            <div
              className="card shadow-sm border-0 mb-4"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-4">
                <div
                  className="border-start border-3 border-danger p-3 rounded"
                  style={{ backgroundColor: "rgba(220, 53, 69, 0.05)" }}
                >
                  <h6 className="fw-semibold mb-2">Supprimer le compte</h6>
                  <p className="text-muted mb-3">
                    Une fois votre compte supprimé, toutes vos données seront
                    définitivement effacées. Cette action est irréversible.
                  </p>
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ borderRadius: "8px", padding: "10px 24px" }}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            {/* Quick Info */}
            <div className="mb-4">
              <h3 className="section-title">Informations</h3>
            </div>
            <div
              className="card shadow-sm border-0 mb-4"
              style={{ borderRadius: "12px" }}
            >
              <div className="card-body p-4">
                <div className="mb-3 pb-3 border-bottom">
                  <small style={{ color: "#6e6f75", fontSize: "0.85rem" }}>
                    Nom d'utilisateur
                  </small>
                  <p className="mb-0 fw-semibold" style={{ color: "#142220" }}>
                    @{username}
                  </p>
                </div>
                <div className="mb-3 pb-3 border-bottom">
                  <small style={{ color: "#6e6f75", fontSize: "0.85rem" }}>
                    Email
                  </small>
                  <p className="mb-0 fw-semibold" style={{ color: "#142220" }}>
                    {session.user.email}
                  </p>
                </div>
                <div>
                  <small style={{ color: "#6e6f75", fontSize: "0.85rem" }}>
                    Rôle
                  </small>
                  <p className="mb-0">
                    <span
                      className="badge"
                      style={{
                        backgroundColor: "#417972",
                        color: "#fff",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        fontWeight: "600",
                      }}
                    >
                      {session.user.role.name}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-4">
              <h3 className="section-title">Actions rapides</h3>
            </div>
            <div className="d-grid gap-3">
              <Link
                href={`/${username}`}
                className="btn d-flex align-items-center justify-content-start gap-3"
                style={{
                  backgroundColor: "#e3ece7",
                  color: "#142220",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  border: "none",
                  textAlign: "left",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#417972",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <i
                    className="bi bi-house"
                    style={{ fontSize: "1.25rem" }}
                  ></i>
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "1rem" }}>
                    Dashboard
                  </div>
                  <small style={{ color: "#6e6f75" }}>Retour à l'accueil</small>
                </div>
              </Link>
              <Link
                href={`/${username}/profile`}
                className="btn d-flex align-items-center justify-content-start gap-3"
                style={{
                  backgroundColor: "#e3ece7",
                  color: "#142220",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  border: "none",
                  textAlign: "left",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#417972",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <i
                    className="bi bi-person"
                    style={{ fontSize: "1.25rem" }}
                  ></i>
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "1rem" }}>
                    Mon profil
                  </div>
                  <small style={{ color: "#6e6f75" }}>
                    Modifier mes informations
                  </small>
                </div>
              </Link>
              <Link
                href={`/${username}/reservations`}
                className="btn d-flex align-items-center justify-content-start gap-3"
                style={{
                  backgroundColor: "#e3ece7",
                  color: "#142220",
                  borderRadius: "12px",
                  padding: "1rem 1.25rem",
                  border: "none",
                  textAlign: "left",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "#417972",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                  }}
                >
                  <i
                    className="bi bi-calendar-check"
                    style={{ fontSize: "1.25rem" }}
                  ></i>
                </div>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "1rem" }}>
                    Réservations
                  </div>
                  <small style={{ color: "#6e6f75" }}>
                    Gérer mes réservations
                  </small>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
