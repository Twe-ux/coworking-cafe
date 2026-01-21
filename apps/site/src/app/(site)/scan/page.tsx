"use client";

import { MarketingContent } from "@/types/promo";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function generateSessionId(): string {
  return (
    "sess_" + Math.random().toString(36).substring(2) + Date.now().toString(36)
  );
}

export default function ScanPage() {
  const router = useRouter();
  const [marketing, setMarketing] = useState<MarketingContent | null>(null);
  const [token, setToken] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [revealing, setRevealing] = useState(false);

  useEffect(() => {
    let storedSessionId = sessionStorage.getItem("promo_session_id");
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      sessionStorage.setItem("promo_session_id", storedSessionId);
    }
    setSessionId(storedSessionId);

    const fetchData = async () => {
      try {
        const marketingRes = await fetch("/api/promo/marketing");
        if (marketingRes.ok) {
          const marketingData = await marketingRes.json();
          setMarketing(marketingData);
        }

        const tokenRes = await fetch("/api/promo/current-token");
        if (tokenRes.ok) {
          const tokenData = await tokenRes.json();
          setToken(tokenData.token);
        }

        await fetch("/api/scan/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: storedSessionId }),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleReveal = async () => {
    setRevealing(true);

    try {
      await fetch("/api/scan/reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      router.push(`/promo/${token}`);
    } catch (error) {
      console.error("Error revealing promo:", error);
      setRevealing(false);
    }
  };

  if (loading) {
    return (
      <section className="py__110">
        <div className="container pb__180">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="row justify-content-center"
          >
            <div className="col-lg-8 col-md-10 card-scan">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4 p-md-5 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4"
                  >
                    <div className="d-inline-block position-relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          width: "80px",
                          height: "80px",
                          border: "4px solid #e9ecef",
                          borderTop: "4px solid #28a745",
                          borderRadius: "50%",
                        }}
                      />
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          width: "12px",
                          height: "12px",
                          backgroundColor: "#28a745",
                          borderRadius: "50%",
                        }}
                      />
                    </div>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="h5 fw-semibold mb-2"
                  >
                    Chargement de votre offre...
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-muted small"
                  >
                    Préparation de votre code promo exclusif
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="d-flex justify-content-center gap-2 mt-4"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -10, 0] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                        style={{
                          width: "8px",
                          height: "8px",
                          backgroundColor: "#28a745",
                          borderRadius: "50%",
                        }}
                      />
                    ))}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py__110">
      <div className="container pb__180">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="row justify-content-center"
        >
          <div className="col-lg-8 col-md-10 card-scan">
            <div className="card shadow-lg border-0">
              <div className="card-body p-4 p-md-5 text-center">
                <motion.h1
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="display-5 fw-bold mb-4"
                >
                  {marketing?.title || "🎉 Bienvenue !"}
                </motion.h1>

                {marketing?.image_url && (
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mb-4"
                  >
                    <img
                      src={marketing.image_url}
                      alt="Promo"
                      className="img-fluid rounded"
                      style={{ maxHeight: "150px" }}
                    />
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-4"
                  dangerouslySetInnerHTML={{
                    __html:
                      marketing?.message ||
                      "<p>Découvrez votre code promo exclusif !</p>",
                  }}
                />

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={handleReveal}
                    disabled={revealing || !token}
                    className="btn btn-scan btn-lg px-5 py-3 fw-bold"
                    style={{ fontSize: "1.2rem" }}
                  >
                    {revealing ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Chargement...
                      </>
                    ) : (
                      marketing?.cta_text || "🎁 Découvrir mon code promo"
                    )}
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4"
                >
                  <small className="text-muted">
                    En cliquant, vous acceptez nos conditions d'utilisation
                  </small>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
