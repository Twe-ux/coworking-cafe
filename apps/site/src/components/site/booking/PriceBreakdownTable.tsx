// ============================================================================
// PriceBreakdownTable Component
// ============================================================================
// Price breakdown table for booking summary page
// Extracted from page.tsx to reduce file size
// Created: 2026-01-29
// ============================================================================

"use client";

import type { BookingData, SelectedService } from "@/types/booking";
import { getPeopleDisplayLabel } from "@/lib/utils/booking-display";

interface PriceBreakdownTableProps {
  bookingData: BookingData;
  selectedServices: Map<string, SelectedService>;
  showTTC: boolean;
  setShowTTC: (show: boolean) => void;
  convertPrice: (priceTTC: number, vatRate: number, toTTC: boolean) => number;
  isDailyRate: () => boolean;
  getTotalPrice: () => number;
}

export default function PriceBreakdownTable({
  bookingData,
  selectedServices,
  showTTC,
  setShowTTC,
  convertPrice,
  isDailyRate,
  getTotalPrice,
}: PriceBreakdownTableProps) {
  return (
    <div className="booking-card">
      <div
        className="d-flex align-items-center gap-3 mb-4 pb-3"
        style={{ borderBottom: "2px solid #f0f0f0" }}
      >
        <i
          className="bi bi-cash-stack"
          style={{ fontSize: "1.5rem", color: "#588983" }}
        ></i>
        <h2
          className="h6 mb-0 fw-bold"
          style={{ fontSize: "1.125rem", color: "#333" }}
        >
          Récapitulatif des prix
        </h2>
      </div>

      <div className="price-breakdown">
        {/* TTC/HT Switch */}
        <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
          <span
            className={`tax-toggle ${showTTC ? "active" : ""}`}
            onClick={() => setShowTTC(true)}
            style={{
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: showTTC ? "600" : "400",
            }}
          >
            Prix TTC
          </span>
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="taxSwitchSummary"
              checked={!showTTC}
              onChange={() => setShowTTC(!showTTC)}
              style={{ cursor: "pointer" }}
            />
          </div>
          <span
            className={`tax-toggle ${!showTTC ? "active" : ""}`}
            onClick={() => setShowTTC(false)}
            style={{
              cursor: "pointer",
              fontSize: "0.875rem",
              fontWeight: !showTTC ? "600" : "400",
            }}
          >
            Prix HT
          </span>
        </div>

        {/* Header Row */}
        <div
          className="price-row d-none d-sm-block"
          style={{
            paddingBottom: "0.75rem",
            marginBottom: "0.5rem",
          }}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <span
              style={{
                fontWeight: "700",
                fontSize: "0.9rem",
                color: "#666",
              }}
            >
              Prestation
            </span>
            <div className="d-flex gap-2 gap-md-4 align-items-center">
              <span
                style={{
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#666",
                  minWidth: "50px",
                  textAlign: "right",
                }}
              >
                Qté
              </span>
              <span
                className="d-none d-md-inline"
                style={{
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#666",
                  minWidth: "100px",
                  textAlign: "right",
                }}
              >
                Prix unitaire
              </span>
              <span
                style={{
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  color: "#666",
                  minWidth: "60px",
                  textAlign: "right",
                }}
              >
                Total
              </span>
            </div>
          </div>
        </div>
        <div className="price-divider"></div>

        {/* Base Rate Row */}
        <div
          className="price-row"
          style={{
            paddingTop: "0.5rem",
            paddingBottom: "0.5rem",
          }}
        >
          <div className="d-flex justify-content-between align-items-center w-100">
            <span>Tarif</span>
            {/* Desktop & Tablet view */}
            <div className="d-none d-sm-flex gap-2 gap-md-4 align-items-center">
              <span
                className="text-muted"
                style={{
                  fontSize: "0.875rem",
                  minWidth: "50px",
                  textAlign: "right",
                }}
              >
                {getPeopleDisplayLabel(bookingData.numberOfPeople, bookingData.spaceType)}
              </span>
              <span
                className="text-muted d-none d-md-inline"
                style={{
                  fontSize: "0.875rem",
                  minWidth: "100px",
                  textAlign: "right",
                }}
              >
                {(() => {
                  const vatRate =
                    bookingData.reservationType === "hourly" ? 10 : 20;
                  const unitPrice = convertPrice(
                    bookingData.basePrice / bookingData.numberOfPeople,
                    vatRate,
                    showTTC,
                  );
                  return unitPrice.toFixed(2);
                })()}
                €
              </span>
              <span
                className="fw-semibold"
                style={{ minWidth: "60px", textAlign: "right" }}
              >
                {(() => {
                  const vatRate =
                    bookingData.reservationType === "hourly" ? 10 : 20;
                  const totalPrice = convertPrice(
                    bookingData.basePrice,
                    vatRate,
                    showTTC,
                  );
                  return totalPrice.toFixed(2);
                })()}
                €
              </span>
            </div>
            {/* Mobile view */}
            <span className="d-sm-none fw-semibold">
              {(() => {
                const vatRate =
                  bookingData.reservationType === "hourly" ? 10 : 20;
                const totalPrice = convertPrice(
                  bookingData.basePrice,
                  vatRate,
                  showTTC,
                );
                return totalPrice.toFixed(2);
              })()}
              €
            </span>
          </div>
        </div>

        {/* Services Rows */}
        {selectedServices.size > 0 &&
          Array.from(selectedServices.values()).map((selected) => {
            const isDaily = isDailyRate();
            const displayPriceTTC =
              isDaily && selected.service.dailyPrice !== undefined
                ? selected.service.dailyPrice
                : selected.service.price;
            const vatRate = selected.service.vatRate || 20;

            const displayPrice = convertPrice(displayPriceTTC, vatRate, showTTC);
            const totalServicePrice =
              selected.service.priceUnit === "per-person"
                ? displayPrice *
                  bookingData.numberOfPeople *
                  selected.quantity
                : displayPrice * selected.quantity;

            return (
              <div
                key={selected.service._id}
                className="price-row"
                style={{
                  paddingTop: "0.5rem",
                  paddingBottom: "0.5rem",
                }}
              >
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>
                    {selected.service.name}{" "}
                    {selected.service.priceUnit === "per-person" && "(par pers.)"}
                  </span>
                  {/* Desktop & Tablet view */}
                  <div className="d-none d-sm-flex gap-2 gap-md-4 align-items-center">
                    <span
                      className="text-muted"
                      style={{
                        fontSize: "0.875rem",
                        minWidth: "50px",
                        textAlign: "right",
                      }}
                    >
                      {selected.quantity}
                    </span>
                    <span
                      className="text-muted d-none d-md-inline"
                      style={{
                        fontSize: "0.875rem",
                        minWidth: "100px",
                        textAlign: "right",
                      }}
                    >
                      {displayPrice.toFixed(2)}€
                    </span>
                    <span
                      className="fw-semibold"
                      style={{
                        minWidth: "60px",
                        textAlign: "right",
                      }}
                    >
                      {totalServicePrice.toFixed(2)}€
                    </span>
                  </div>
                  {/* Mobile view */}
                  <span className="d-sm-none fw-semibold">
                    {totalServicePrice.toFixed(2)}€
                  </span>
                </div>
              </div>
            );
          })}

        {/* Total Row */}
        <div className="price-row total-row">
          <span>Total {showTTC ? "TTC" : "HT"}</span>
          <span className="total-price">
            {(() => {
              const totalTTC = getTotalPrice();

              if (showTTC) {
                return totalTTC.toFixed(2);
              } else {
                const baseVatRate =
                  bookingData.reservationType === "hourly" ? 10 : 20;
                const baseHT = convertPrice(
                  bookingData.basePrice,
                  baseVatRate,
                  false,
                );

                let servicesHT = 0;
                selectedServices.forEach((selected) => {
                  const service = selected.service;
                  const quantity = selected.quantity;
                  const isDaily = isDailyRate();
                  const displayPriceTTC =
                    isDaily && service.dailyPrice !== undefined
                      ? service.dailyPrice
                      : service.price;
                  const vatRate = service.vatRate || 20;
                  const displayPriceHT = convertPrice(
                    displayPriceTTC,
                    vatRate,
                    false,
                  );

                  if (service.priceUnit === "per-person") {
                    servicesHT +=
                      displayPriceHT * bookingData.numberOfPeople * quantity;
                  } else {
                    servicesHT += displayPriceHT * quantity;
                  }
                });

                return (baseHT + servicesHT).toFixed(2);
              }
            })()}
            €
          </span>
        </div>
      </div>
    </div>
  );
}
