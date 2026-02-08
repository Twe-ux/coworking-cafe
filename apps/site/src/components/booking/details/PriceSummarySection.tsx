import type { AdditionalService } from "@/types/booking";

interface PriceSummarySectionProps {
  bookingData: {
    basePrice: number;
    numberOfPeople: number;
    reservationType: "hourly" | "daily";
    isDailyRate?: boolean;
  };
  selectedServices: Map<string, { service: AdditionalService; quantity: number }>;
  showTTC: boolean;
  onToggleTTC: () => void;
  convertPrice: (price: number, vatRate: number, isTTC: boolean) => number;
  getTotalPrice: () => number;
}

// Helper component for TTC/HT toggle
function TaxToggle({
  showTTC,
  onToggle,
}: {
  showTTC: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="d-flex justify-content-end align-items-center gap-3 mb-3">
      <span
        className={`tax-toggle ${showTTC ? "active" : ""}`}
        onClick={onToggle}
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
          id="taxSwitchDetails"
          checked={!showTTC}
          onChange={onToggle}
          style={{ cursor: "pointer" }}
        />
      </div>
      <span
        className={`tax-toggle ${!showTTC ? "active" : ""}`}
        onClick={onToggle}
        style={{
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: !showTTC ? "600" : "400",
        }}
      >
        Prix HT
      </span>
    </div>
  );
}

// Helper component for table header
function PriceTableHeader() {
  return (
    <>
      <div
        className="price-row"
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
          <div className="d-flex gap-4 align-items-center">
            <span
              style={{
                fontWeight: "700",
                fontSize: "0.85rem",
                color: "#666",
                minWidth: "80px",
                textAlign: "right",
              }}
            >
              Quantité
            </span>
            <span
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
                minWidth: "80px",
                textAlign: "right",
              }}
            >
              Total
            </span>
          </div>
        </div>
      </div>
      <div className="price-divider"></div>
    </>
  );
}

// Helper component for base rate row
function BaseRateRow({
  basePrice,
  numberOfPeople,
  reservationType,
  showTTC,
  convertPrice,
}: {
  basePrice: number;
  numberOfPeople: number;
  reservationType: "hourly" | "daily";
  showTTC: boolean;
  convertPrice: (price: number, vatRate: number, isTTC: boolean) => number;
}) {
  const vatRate = reservationType === "hourly" ? 10 : 20;
  const unitPrice = convertPrice(basePrice / numberOfPeople, vatRate, showTTC);
  const totalPrice = convertPrice(basePrice, vatRate, showTTC);

  return (
    <div
      className="price-row"
      style={{
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
      }}
    >
      <div className="d-flex justify-content-between align-items-center w-100">
        <span>Tarif </span>
        <div className="d-flex gap-4 align-items-center">
          <span
            className="text-muted"
            style={{
              fontSize: "0.875rem",
              minWidth: "80px",
              textAlign: "right",
            }}
          >
            {numberOfPeople} {numberOfPeople > 1 ? "pers." : "pers."}
          </span>
          <span
            className="text-muted"
            style={{
              fontSize: "0.875rem",
              minWidth: "100px",
              textAlign: "right",
            }}
          >
            {unitPrice.toFixed(2)}€
          </span>
          <span
            className="fw-semibold"
            style={{ minWidth: "80px", textAlign: "right" }}
          >
            {totalPrice.toFixed(2)}€
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PriceSummarySection({
  bookingData,
  selectedServices,
  showTTC,
  onToggleTTC,
  convertPrice,
  getTotalPrice,
}: PriceSummarySectionProps) {
  const isDailyRate = bookingData.isDailyRate === true;

  const calculateTotalHT = () => {
    const baseVatRate = bookingData.reservationType === "hourly" ? 10 : 20;
    const baseHT = convertPrice(bookingData.basePrice, baseVatRate, false);

    let servicesHT = 0;
    selectedServices.forEach((selected) => {
      const service = selected.service;
      const quantity = selected.quantity;
      const displayPriceTTC =
        isDailyRate && service.dailyPrice !== undefined
          ? service.dailyPrice
          : service.price;
      const vatRate = service.vatRate || 20;
      const displayPriceHT = convertPrice(displayPriceTTC, vatRate, false);

      if (service.priceUnit === "per-person") {
        servicesHT +=
          displayPriceHT * bookingData.numberOfPeople * quantity;
      } else {
        servicesHT += displayPriceHT * quantity;
      }
    });

    return baseHT + servicesHT;
  };

  return (
    <div className="price-breakdown">
      <TaxToggle showTTC={showTTC} onToggle={onToggleTTC} />
      <PriceTableHeader />

      <BaseRateRow
        basePrice={bookingData.basePrice}
        numberOfPeople={bookingData.numberOfPeople}
        reservationType={bookingData.reservationType}
        showTTC={showTTC}
        convertPrice={convertPrice}
      />

      {/* Services Rows */}
      {Array.from(selectedServices.values()).map(({ service, quantity }) => {
        const displayPriceTTC =
          isDailyRate && service.dailyPrice !== undefined
            ? service.dailyPrice
            : service.price;
        const vatRate = service.vatRate || 20;
        const displayPrice = convertPrice(displayPriceTTC, vatRate, showTTC);
        const totalServicePrice =
          service.priceUnit === "per-person"
            ? displayPrice * bookingData.numberOfPeople * quantity
            : displayPrice * quantity;

        return (
          <div
            key={service._id}
            className="price-row"
            style={{
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
            }}
          >
            <div className="d-flex justify-content-between align-items-center w-100">
              <span>
                {service.name}{" "}
                {service.priceUnit === "per-person" ? "(par pers.)" : ""}
              </span>
              <div className="d-flex gap-4 align-items-center">
                <span
                  className="text-muted"
                  style={{
                    fontSize: "0.875rem",
                    minWidth: "80px",
                    textAlign: "right",
                  }}
                >
                  {quantity}
                </span>
                <span
                  className="text-muted"
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
                    minWidth: "80px",
                    textAlign: "right",
                  }}
                >
                  {totalServicePrice.toFixed(2)}€
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Total Row */}
      <div className="price-row total-row">
        <span>Total {showTTC ? "TTC" : "HT"}</span>
        <span className="total-price">
          {showTTC
            ? getTotalPrice().toFixed(2)
            : calculateTotalHT().toFixed(2)}
          €
        </span>
      </div>
    </div>
  );
}
