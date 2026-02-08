import type { AdditionalService } from "@/types/booking";

interface AdditionalServicesSectionProps {
  servicesLoading: boolean;
  availableServices: AdditionalService[];
  selectedServices: Map<string, { service: AdditionalService; quantity: number }>;
  selectedCategory: string | null;
  bookingData: {
    numberOfPeople: number;
    isDailyRate?: boolean;
  };
  onCategorySelect: (category: string) => void;
  onToggleService: (service: AdditionalService) => void;
  onUpdateQuantity: (serviceId: string, quantity: number) => void;
}

export default function AdditionalServicesSection({
  servicesLoading,
  availableServices,
  selectedServices,
  selectedCategory,
  bookingData,
  onCategorySelect,
  onToggleService,
  onUpdateQuantity,
}: AdditionalServicesSectionProps) {
  if (servicesLoading || availableServices.length === 0) {
    return null;
  }

  const isDailyRate = bookingData.isDailyRate === true;

  const categoryLabels: Record<string, string> = {
    food: "Nourritures",
    beverage: "Boissons",
    equipment: "Équipements",
    other: "Autres",
  };

  const availableCategories = ["food", "beverage", "equipment", "other"]
    .map((cat) => ({
      category: cat,
      count: availableServices.filter((s) => s.category === cat).length,
    }))
    .filter((item) => item.count > 0);

  return (
    <div className="mb-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <i className="bi bi-plus-circle text-success"></i>
        <label className="form-label mb-0 fw-semibold">
          Services supplémentaires{" "}
          <span className="text-muted fw-normal">(optionnel)</span>
        </label>
      </div>

      {/* Category Buttons */}
      <div className="d-flex gap-2 flex-wrap mb-3">
        {availableCategories.map((item) => (
          <button
            key={item.category}
            type="button"
            className="filter-btn"
            onClick={() => onCategorySelect(item.category)}
          >
            {categoryLabels[item.category]} ({item.count})
          </button>
        ))}
      </div>

      {/* Selected Services Summary */}
      {selectedServices.size > 0 && (
        <div className="alert alert-light border">
          <div className="fw-semibold mb-2" style={{ fontSize: "0.85rem" }}>
            Services sélectionnés :
          </div>
          {Array.from(selectedServices.values()).map(({ service, quantity }) => {
            const displayPrice =
              isDailyRate && service.dailyPrice !== undefined
                ? service.dailyPrice
                : service.price;
            const totalServicePrice =
              service.priceUnit === "per-person"
                ? displayPrice * bookingData.numberOfPeople * quantity
                : displayPrice * quantity;

            return (
              <div
                key={service._id}
                className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom"
              >
                <div className="flex-grow-1">
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {service.name} · {displayPrice.toFixed(2)}€{" "}
                    {service.priceUnit === "per-person" ? "/ pers." : ""}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => onUpdateQuantity(service._id, quantity - 1)}
                        disabled={quantity <= 1}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                        }}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        disabled
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.75rem",
                          minWidth: "40px",
                        }}
                      >
                        {quantity}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => onUpdateQuantity(service._id, quantity + 1)}
                        style={{
                          fontSize: "0.75rem",
                          padding: "0.25rem 0.5rem",
                        }}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "700",
                        color: "#3d6661",
                        minWidth: "60px",
                        textAlign: "right",
                      }}
                    >
                      {totalServicePrice.toFixed(2)}€
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-link text-danger p-0"
                    onClick={() => onToggleService(service)}
                    style={{ fontSize: "0.9rem" }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
