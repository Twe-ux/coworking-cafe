"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProfileClientProps {
  name: string;
  email: string;
  username: string;
  roleName: string;
  phone?: string;
  companyName?: string;
}

export default function ProfileClient({
  name,
  email,
  username,
  roleName,
  phone,
  companyName,
}: ProfileClientProps) {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Profile form state
  const [profileData, setProfileData] = useState({
    name: name || "",
    email: email || "",
    phone: phone || "",
    companyName: companyName || "",
  });

  // Update profile data when props change
  useEffect(() => {
    setProfileData({
      name: name || "",
      email: email || "",
      phone: phone || "",
      companyName: companyName || "",
    });
  }, [name, email, phone, companyName]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Profil mis à jour avec succès" });
        setIsEditingProfile(false);

        // Update NextAuth session - this will reload data from database
        if (update) {
          await update();
        }
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors de la mise à jour",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {message.text && (
        <div
          className={`alert alert-${
            message.type === "success" ? "success" : "danger"
          } alert-dismissible fade show border-start border-3 mb-4`}
          role="alert"
        >
          <i
            className={`bi bi-${
              message.type === "success"
                ? "check-circle"
                : "exclamation-triangle"
            } me-2`}
          ></i>
          {message.text}
          <button
            type="button"
            className="btn-close"
            onClick={() => setMessage({ type: "", text: "" })}
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Profile Information */}
      <div className="mb-4">
        <h2 className="section-title">Informations personnelles</h2>
      </div>
      <div
        className="card shadow-sm border-0 mb-4"
        style={{ borderRadius: "12px" }}
      >
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-semibold" style={{ color: "#142220" }}>
              Détails du compte
            </h5>
            {!isEditingProfile && (
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  backgroundColor: "#417972",
                  color: "#fff",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  border: "none",
                }}
                onClick={() => setIsEditingProfile(true)}
              >
                <i className="bi bi-pencil me-2"></i>
                Modifier
              </button>
            )}
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label fw-semibold">
                Nom complet
              </label>
              <input
                type="text"
                className="form-control"
                id="name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                disabled={!isEditingProfile}
                style={{
                  borderRadius: "8px",
                  border: "2px solid #e3ece7",
                  padding: "12px",
                  backgroundColor: isEditingProfile ? "#fff" : "#f8f9fa",
                }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="username" className="form-label fw-semibold">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                disabled
                style={{
                  borderRadius: "8px",
                  border: "2px solid #e3ece7",
                  padding: "12px",
                  backgroundColor: "#e3ece7",
                  color: "#6e6f75",
                }}
              />
              <div
                className="border-start border-3 p-2 mt-1"
                style={{
                  borderLeftColor: "#f2d381",
                  backgroundColor: "rgba(242, 211, 129, 0.1)",
                  borderRadius: "4px",
                }}
              >
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Le nom d'utilisateur ne peut pas être modifié
                </small>
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({ ...profileData, email: e.target.value })
                }
                disabled={!isEditingProfile}
                style={{
                  borderRadius: "8px",
                  border: "2px solid #e3ece7",
                  padding: "12px",
                  backgroundColor: isEditingProfile ? "#fff" : "#f8f9fa",
                }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="phone" className="form-label fw-semibold">
                Téléphone
              </label>
              <input
                type="tel"
                className="form-control"
                id="phone"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                disabled={!isEditingProfile}
                placeholder="06 XX XX XX XX"
                style={{
                  borderRadius: "8px",
                  border: "2px solid #e3ece7",
                  padding: "12px",
                  backgroundColor: isEditingProfile ? "#fff" : "#f8f9fa",
                }}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="companyName" className="form-label fw-semibold">
                Raison sociale
              </label>
              <input
                type="text"
                className="form-control"
                id="companyName"
                value={profileData.companyName}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    companyName: e.target.value,
                  })
                }
                disabled={!isEditingProfile}
                placeholder="Nom de votre société (optionnel)"
                style={{
                  borderRadius: "8px",
                  border: "2px solid #e3ece7",
                  padding: "12px",
                  backgroundColor: isEditingProfile ? "#fff" : "#f8f9fa",
                }}
              />
            </div>

            {isEditingProfile && (
              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn"
                  disabled={loading}
                  style={{
                    backgroundColor: "#417972",
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    border: "none",
                  }}
                >
                  {loading ? "Enregistrement..." : "Enregistrer"}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileData({
                      name: name || "",
                      email: email || "",
                      phone: phone || "",
                      companyName: companyName || "",
                    });
                    setMessage({ type: "", text: "" });
                  }}
                  style={{
                    backgroundColor: "#e3ece7",
                    color: "#142220",
                    borderRadius: "8px",
                    padding: "10px 24px",
                    border: "none",
                  }}
                >
                  Annuler
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
