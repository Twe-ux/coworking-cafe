"use client";

import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { Icon } from "@iconify/react";

interface PinCodeModalProps {
  show: boolean;
  onHide: () => void;
  employeeName: string;
  onValidate: (pin: string) => void;
}

export default function PinCodeModal({
  show,
  onHide,
  employeeName,
  onValidate,
}: PinCodeModalProps) {
  const [pin, setPin] = useState("");

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleClear = () => {
    setPin(pin.slice(0, -1));
  };

  const handleCancel = () => {
    setPin("");
    onHide();
  };

  const handleValidate = () => {
    if (pin.length === 4) {
      onValidate(pin);
      setPin("");
    }
  };

  const handleHide = () => {
    setPin("");
    onHide();
  };

  return (
    <Modal show={show} onHide={handleHide} centered size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="w-100 text-center fs-5 fw-bold">
          Commencer le pointage
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <div className="text-center">
          {/* Titre et nom de l'employé */}
          <h6 className="fw-bold mb-1" style={{ fontSize: "15px" }}>
            Code PIN requis
          </h6>
          <p className="text-muted mb-3" style={{ fontSize: "14px" }}>
            {employeeName}
          </p>

          {/* Indicateurs de PIN */}
          <div className="d-flex justify-content-center gap-2 mb-3">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: pin.length > index ? "#3b82f6" : "#e5e7eb",
                  transition: "background-color 0.2s",
                }}
              />
            ))}
          </div>

          <p className="text-muted mb-3" style={{ fontSize: "13px" }}>
            Saisissez votre code PIN à 4 chiffres
          </p>

          {/* Pavé numérique */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              maxWidth: "280px",
              margin: "0 auto 20px",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                disabled={pin.length >= 4}
                style={{
                  padding: "18px",
                  fontSize: "22px",
                  fontWeight: "600",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  cursor: pin.length >= 4 ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (pin.length < 4) {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#e5e7eb";
                }}
              >
                {num}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "8px",
              maxWidth: "280px",
              margin: "0 auto 24px",
            }}
          >
            <div />
            <button
              onClick={() => handleNumberClick("0")}
              disabled={pin.length >= 4}
              style={{
                padding: "18px",
                fontSize: "22px",
                fontWeight: "600",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                backgroundColor: "white",
                cursor: pin.length >= 4 ? "not-allowed" : "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (pin.length < 4) {
                  e.currentTarget.style.backgroundColor = "#f9fafb";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "white";
                e.currentTarget.style.borderColor = "#e5e7eb";
              }}
            >
              0
            </button>
            <div />
          </div>

          {/* Boutons d'action */}
          <div className="d-flex gap-2 justify-content-center">
            <Button
              variant="outline-secondary"
              onClick={handleClear}
              disabled={pin.length === 0}
              className="px-3 py-2"
              style={{ fontSize: "14px" }}
            >
              <Icon icon="ri:delete-back-2-line" width={16} className="me-1" />
              Effacer
            </Button>
            <Button
              variant="outline-secondary"
              onClick={handleCancel}
              className="px-3 py-2"
              style={{ fontSize: "14px" }}
            >
              <Icon icon="ri:close-line" width={16} className="me-1" />
              Annuler
            </Button>
            <Button
              variant="success"
              onClick={handleValidate}
              disabled={pin.length !== 4}
              className="px-3 py-2"
              style={{
                backgroundColor: "#6b9f7f",
                borderColor: "#6b9f7f",
                fontSize: "14px",
              }}
            >
              <Icon icon="ri:check-line" width={16} className="me-1" />
              Valider
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}
