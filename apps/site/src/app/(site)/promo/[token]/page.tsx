"use client";

import { PromoCode } from "@/types/promo";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function PromoPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [promo, setPromo] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const res = await fetch(`/api/promo/${token}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError("Code promo non trouvé ou expiré");
          } else {
            setError("Erreur lors du chargement");
          }
          return;
        }

        const data = await res.json();
        setPromo(data);
      } catch (err) {
        setError("Erreur de connexion");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPromo();
    }
  }, [token]);

  const handleCopy = async () => {
    if (!promo) return;

    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);

      const sessionId = sessionStorage.getItem("promo_session_id");
      if (sessionId) {
        await fetch("/api/scan/copy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId }),
        });
      }

      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      console.error("Error copying code:", error);
    }
  };

  const formatDiscount = () => {
    if (!promo) return "";
    switch (promo.discount_type) {
      case "percentage":
        return `-${promo.discount_value}%`;
      case "fixed":
        return `-${promo.discount_value}€`;
      case "free_item":
        return `${promo.discount_value}€ offerts`;
      default:
        return "";
    }
  };

  if (loading) {
    return (
      <section className="py__130">
        <div className="container">
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py__130">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card border-danger">
                <div className="card-body text-center p-5">
                  <i
                    className="bi bi-exclamation-circle text-danger"
                    style={{ fontSize: "3rem" }}
                  ></i>
                  <h3 className="mt-3">{error}</h3>
                  <p className="text-muted">
                    Veuillez scanner à nouveau le QR code
                  </p>
                  <button
                    onClick={() => router.push("/scan")}
                    className="btn btn-primary mt-3"
                  >
                    Retour au scan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py__110">
      <div className="container pb__180">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="row justify-content-center"
        >
          <div className="col-lg-6 col-md-8 card-promo">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5 text-center">
                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4"
                >
                  <span className="badge bg-success fs-4 px-4 py-2">
                    {formatDiscount()}
                  </span>
                </motion.div>

                <h2 className="mb-3">🎉 Votre code promo</h2>
                <p className="text-muted mb-4">{promo?.description}</p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-light rounded p-4 mb-4"
                >
                  <code className="fs-2 fw-bold">{promo?.code}</code>
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopy}
                  className={`btn btn-scan btn-lg px-5 py-3 ${
                    copied ? "btn-success" : "btn-scan"
                  }`}
                >
                  {copied ? (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Copié !
                    </>
                  ) : (
                    <>
                      <i className="bi bi-clipboard me-2"></i>
                      Copier le code
                    </>
                  )}
                </motion.button>

                <div className="mt-4 pt-4 border-top">
                  <small className="text-muted d-block">
                    Valable jusqu'au{" "}
                    {promo &&
                      new Date(promo.valid_until).toLocaleDateString("fr-FR")}
                  </small>
                  {promo && promo.max_uses > 0 && (
                    <small className="text-muted d-block mt-1">
                      {promo.max_uses - promo.current_uses} utilisations
                      restantes
                    </small>
                  )}
                </div>

                <div className="mt-4">
                  <p className="small text-muted">
                    Présentez ce code à l'accueil ou utilisez-le lors de votre
                    réservation en ligne
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
