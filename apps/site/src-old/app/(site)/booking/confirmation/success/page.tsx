"use client";

import { Suspense } from "react";
import SuccessPageContent from "./SuccessPageContent";

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="confirmation-page py-5" style={{ minHeight: "100vh", paddingBottom: "200px" }}>
          <div className="container py-5">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="booking-card text-center">
                  <div className="mb-4">
                    <div
                      className="spinner-border text-success"
                      role="status"
                      style={{ width: "4rem", height: "4rem" }}
                    >
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                  <h2 className="mb-3" style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                    Chargement...
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </section>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
