"use client";

import { useState } from "react";

export default function SecuritySection() {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: "error",
        text: "Les mots de passe ne correspondent pas",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          type: "success",
          text: "Mot de passe modifié avec succès",
        });
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsEditingPassword(false);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Erreur lors du changement de mot de passe",
        });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
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

      <div className="mb-3">
        <h3 className="section-title">Sécurité</h3>
      </div>
      <div className="card shadow-sm border-0" style={{ borderRadius: "12px" }}>
        <div className="card-body p-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0 fw-semibold" style={{ color: "#142220" }}>
              Changer le mot de passe
            </h5>
            {!isEditingPassword && (
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
                onClick={() => setIsEditingPassword(true)}
              >
                <i className="bi bi-key me-2"></i>
                Modifier
              </button>
            )}
          </div>

          {isEditingPassword ? (
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label
                  htmlFor="currentPassword"
                  className="form-label fw-semibold"
                >
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #e0e0e0",
                    padding: "12px",
                  }}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label fw-semibold">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="newPassword"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #e3ece7",
                    padding: "12px",
                  }}
                  autoComplete="new-password"
                />
              </div>

              <div className="mb-3">
                <label
                  htmlFor="confirmPassword"
                  className="form-label fw-semibold"
                >
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  style={{
                    borderRadius: "8px",
                    border: "2px solid #e3ece7",
                    padding: "12px",
                  }}
                  autoComplete="new-password"
                />
              </div>

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
                  {loading ? "Modification..." : "Changer le mot de passe"}
                </button>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    setIsEditingPassword(false);
                    setPasswordData({
                      currentPassword: "",
                      newPassword: "",
                      confirmPassword: "",
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
            </form>
          ) : (
            <div
              className="border-start border-3 p-3 rounded"
              style={{
                backgroundColor: "rgba(65, 121, 114, 0.05)",
                borderColor: "#417972 !important",
              }}
            >
              <p className="text-muted mb-0">
                <i className="bi bi-shield-lock me-2"></i>
                Cliquez sur "Modifier" pour changer votre mot de passe
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
