import { Icon } from "@iconify/react";
import { Button, Modal } from "react-bootstrap";

interface SpaceConfiguration {
  spaceType: string;
  name: string;
  pricing: {
    hourly: number;
    daily: number;
    perPerson: boolean;
    tiers?: Array<{
      minPeople: number;
      maxPeople: number;
      hourlyRate: number;
      dailyRate: number;
      extraPersonHourly?: number;
      extraPersonDaily?: number;
    }>;
    maxHoursBeforeDaily?: number;
    dailyRatePerPerson?: number;
  };
  minCapacity: number;
  maxCapacity: number;
  requiresQuote?: boolean;
}

interface CreateReservationModalProps {
  show: boolean;
  onHide: () => void;
  selectedDate: Date | null;
  selectedTimeSlot: { start: string; end: string } | null;
  spaceConfigurations: SpaceConfiguration[];
  isPendingStatus: boolean;
  setIsPendingStatus: (value: boolean) => void;
  paymentType: string;
  setPaymentType: (value: string) => void;
  isPartialPrivatization: boolean;
  setIsPartialPrivatization: (value: boolean) => void;
  selectedSpaceType: string;
  setSelectedSpaceType: (value: string) => void;
  selectedSpaceConfig: SpaceConfiguration | undefined;
  calculatedPrice: number | null;
  setCalculatedPrice: (value: number | null) => void;
  calculatePrice: (
    spaceType: string,
    numberOfPeople: number,
    startTime: string,
    endTime: string
  ) => number | null;
  formatDateForAPI: (date: Date) => string;
  setMessage: (message: { type: "success" | "error"; text: string } | null) => void;
  setShowCreateModal: (show: boolean) => void;
  fetchReservations: () => void;
  fetchExceptionalClosures: () => void;
}

const CreateReservationModal: React.FC<CreateReservationModalProps> = ({
  show,
  onHide,
  selectedDate,
  selectedTimeSlot,
  spaceConfigurations,
  isPendingStatus,
  setIsPendingStatus,
  paymentType,
  setPaymentType,
  isPartialPrivatization,
  setIsPartialPrivatization,
  selectedSpaceType,
  setSelectedSpaceType,
  selectedSpaceConfig,
  calculatedPrice,
  setCalculatedPrice,
  calculatePrice,
  formatDateForAPI,
  setMessage,
  setShowCreateModal,
  fetchReservations,
  fetchExceptionalClosures,
}) => {
  return (
    <Modal
      show={show}
      onHide={() => {
        onHide();
        setIsPendingStatus(false);
        setPaymentType("unpaid");
        setIsPartialPrivatization(false);
      }}
      size="lg"
      centered
    >
      <Modal.Header
        closeButton
        className="border-0"
        style={{ padding: "1.5rem 1.75rem" }}
      >
        <Modal.Title style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          Nouvelle réservation
          {selectedDate &&
            ` - ${selectedDate.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "0 1.75rem 1.5rem" }}>
        <form
          id="reservation-form"
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);

            const reservation = {
              spaceType: formData.get("spaceType"),
              date: selectedDate ? formatDateForAPI(selectedDate) : "",
              startTime: formData.get("startTime"),
              endTime: formData.get("endTime"),
              contactName: formData.get("contactName"),
              contactEmail: formData.get("contactEmail"),
              numberOfPeople: parseInt(
                formData.get("numberOfPeople") as string
              ),
              totalPrice: calculatedPrice === null ? 0 : calculatedPrice, // Sur devis = 0 for now, to be updated later
              status: isPendingStatus ? "pending" : "confirmed",
              paymentStatus: formData.get("paymentStatus"),
              amountPaid: formData.get("amountPaid")
                ? parseFloat(formData.get("amountPaid") as string)
                : 0,
              invoiceOption: formData.get("invoiceOption") === "true",
              isPartialPrivatization: isPartialPrivatization,
            };
            fetch("/api/admin/reservations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(reservation),
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  setMessage({
                    type: "success",
                    text: "Réservation créée avec succès",
                  });
                  setShowCreateModal(false);
                  setIsPendingStatus(false); // Reset checkbox
                  setPaymentType("unpaid"); // Reset payment type
                  setIsPartialPrivatization(false); // Reset privatization
                  fetchReservations();
                  fetchExceptionalClosures(); // Reload closures in case one was added
                } else {
                  // Show detailed error message
                  let errorMsg = data.error || "Erreur lors de la création";
                  if (data.validationErrors) {
                    errorMsg +=
                      ": " +
                      data.validationErrors
                        .map((e: any) => `${e.field} - ${e.message}`)
                        .join(", ");
                  }                  setMessage({ type: "error", text: errorMsg });
                }
              })
              .catch((err) => {                setMessage({
                  type: "error",
                  text: "Erreur lors de la création",
                });
              });
          }}
        >
          <div className="row g-3">
            <div className="col-md-6">
              <label
                className="form-label"
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                Type d&apos;espace
              </label>
              <select
                name="spaceType"
                className="form-select"
                required
                style={{ borderRadius: "8px" }}
                onChange={(e) => {
                  setSelectedSpaceType(e.target.value);
                  const form = document.getElementById(
                    "reservation-form"
                  ) as HTMLFormElement;
                  if (form) {
                    const formData = new FormData(form);
                    const spaceType = e.target.value;
                    const numberOfPeople =
                      parseInt(formData.get("numberOfPeople") as string) || 1;
                    const startTime =
                      (formData.get("startTime") as string) || "09:00";
                    const endTime =
                      (formData.get("endTime") as string) || "10:00";
                    const price = calculatePrice(
                      spaceType,
                      numberOfPeople,
                      startTime,
                      endTime
                    );
                    setCalculatedPrice(price);
                  }
                }}
              >
                <option value="">Sélectionner...</option>
                {spaceConfigurations.map((config) => (
                  <option key={config.spaceType} value={config.spaceType}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label
                className="form-label"
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                Nombre de personnes
                {selectedSpaceConfig && (
                  <small className="text-muted ms-2">
                    (min: {selectedSpaceConfig.minCapacity}, max:{" "}
                    {selectedSpaceConfig.maxCapacity})
                  </small>
                )}
              </label>
              <input
                type="number"
                name="numberOfPeople"
                className="form-control"
                min={selectedSpaceConfig?.minCapacity || 1}
                max={selectedSpaceConfig?.maxCapacity || 100}
                defaultValue={selectedSpaceConfig?.minCapacity || 1}
                required
                style={{ borderRadius: "8px" }}
                onChange={(e) => {
                  const form = document.getElementById(
                    "reservation-form"
                  ) as HTMLFormElement;
                  if (form) {
                    const formData = new FormData(form);
                    const spaceType = formData.get("spaceType") as string;
                    const numberOfPeople = parseInt(e.target.value) || 1;
                    const startTime =
                      (formData.get("startTime") as string) || "09:00";
                    const endTime =
                      (formData.get("endTime") as string) || "10:00";
                    if (spaceType) {
                      const price = calculatePrice(
                        spaceType,
                        numberOfPeople,
                        startTime,
                        endTime
                      );
                      setCalculatedPrice(price);
                    }
                  }
                }}
              />
            </div>

            <div className="col-md-6">
              <label
                className="form-label"
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                Heure de début
              </label>
              <input
                type="time"
                name="startTime"
                className="form-control"
                defaultValue={selectedTimeSlot?.start || "09:00"}
                required
                style={{ borderRadius: "8px" }}
                onChange={(e) => {
                  const form = document.getElementById(
                    "reservation-form"
                  ) as HTMLFormElement;
                  if (form) {
                    const formData = new FormData(form);
                    const spaceType = formData.get("spaceType") as string;
                    const numberOfPeople =
                      parseInt(formData.get("numberOfPeople") as string) || 1;
                    const startTime = e.target.value;
                    const endTime =
                      (formData.get("endTime") as string) || "10:00";
                    if (spaceType) {
                      const price = calculatePrice(
                        spaceType,
                        numberOfPeople,
                        startTime,
                        endTime
                      );
                      setCalculatedPrice(price);
                    }
                  }
                }}
              />
            </div>

            <div className="col-md-6">
              <label
                className="form-label"
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                Heure de fin
              </label>
              <input
                type="time"
                name="endTime"
                className="form-control"
                defaultValue={selectedTimeSlot?.end || "10:00"}
                required
                style={{ borderRadius: "8px" }}
                onChange={(e) => {
                  const form = document.getElementById(
                    "reservation-form"
                  ) as HTMLFormElement;
                  if (form) {
                    const formData = new FormData(form);
                    const spaceType = formData.get("spaceType") as string;
                    const numberOfPeople =
                      parseInt(formData.get("numberOfPeople") as string) || 1;
                    const startTime =
                      (formData.get("startTime") as string) || "09:00";
                    const endTime = e.target.value;
                    if (spaceType) {
                      const price = calculatePrice(
                        spaceType,
                        numberOfPeople,
                        startTime,
                        endTime
                      );
                      setCalculatedPrice(price);
                    }
                  }
                }}
              />
            </div>

            <div className="col-md-6">
              <label
                className="form-label"
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                Nom du client
              </label>
              <input
                type="text"
                name="contactName"
                className="form-control"
                required
                style={{ borderRadius: "8px" }}
                placeholder="Nom complet"
              />
            </div>

            <div className="col-md-6">
              <label
                className="form-label"
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                Email du client
              </label>
              <input
                type="email"
                name="contactEmail"
                className="form-control"
                required
                style={{ borderRadius: "8px" }}
                placeholder="email@example.com"
              />
            </div>

            <div className="col-md-12">
              <label
                className="form-label"
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                Prix total (€)
              </label>
              <input
                type="text"
                name="totalPrice"
                className="form-control"
                value={
                  calculatedPrice === null
                    ? "Sur devis"
                    : calculatedPrice.toFixed(2) + " €"
                }
                readOnly
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#f3f4f6",
                  fontWeight: 600,
                  fontSize: "16px",
                  color: calculatedPrice === null ? "#F59E0B" : "#10B981",
                }}
              />
              {calculatedPrice !== null && (
                <small
                  className="text-muted"
                  style={{
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  <Icon
                    icon="ri:information-line"
                    width={14}
                    style={{ marginRight: "4px" }}
                  />
                  Prix calculé automatiquement selon la configuration de
                  l&apos;espace
                </small>
              )}
              {calculatedPrice === null && (
                <small
                  className="text-warning"
                  style={{
                    fontSize: "12px",
                    marginTop: "4px",
                    display: "block",
                  }}
                >
                  <Icon
                    icon="ri:alert-line"
                    width={14}
                    style={{ marginRight: "4px" }}
                  />
                  Tarif sur devis - Contactez le client pour définir le prix
                </small>
              )}
            </div>

            <div className="col-12">
              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  name="invoiceOption"
                  className="form-check-input"
                  id="invoiceOption"
                  value="true"
                  onChange={(e) => {
                    if (e.target.checked) {
                      // Si facture cochée, mettre le statut de paiement à "pending" (en attente de facture)
                      const paymentSelect = document.querySelector(
                        'select[name="paymentStatus"]'
                      ) as HTMLSelectElement;
                      if (paymentSelect) {
                        paymentSelect.value = "pending";
                        paymentSelect.disabled = true;
                        setPaymentType("pending");
                      }
                    } else {
                      // Si facture décochée, réactiver le select et remettre à unpaid
                      const paymentSelect = document.querySelector(
                        'select[name="paymentStatus"]'
                      ) as HTMLSelectElement;
                      if (paymentSelect) {
                        paymentSelect.value = "unpaid";
                        paymentSelect.disabled = false;
                        setPaymentType("unpaid");
                      }
                    }
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="invoiceOption"
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    fontWeight: 500,
                  }}
                >
                  <Icon
                    icon="ri:file-text-line"
                    width={16}
                    style={{ marginRight: "4px" }}
                  />
                  Sur facture
                </label>
              </div>

              <div className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="pendingStatusOption"
                  checked={isPendingStatus}
                  onChange={(e) => setIsPendingStatus(e.target.checked)}
                />
                <label
                  className="form-check-label"
                  htmlFor="pendingStatusOption"
                  style={{
                    fontSize: "14px",
                    color: "#374151",
                    fontWeight: 500,
                  }}
                >
                  <Icon
                    icon="ri:time-line"
                    width={16}
                    style={{ marginRight: "4px", color: "#F59E0B" }}
                  />
                  Mettre en attente
                  <small
                    className="text-muted d-block"
                    style={{ fontSize: "12px", marginLeft: "20px" }}
                  >
                    Par défaut, la réservation est validée directement (saisie
                    manuelle)
                  </small>
                </label>
              </div>

              {selectedSpaceType === "evenementiel" && (
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="partialPrivatizationOption"
                    checked={isPartialPrivatization}
                    onChange={(e) =>
                      setIsPartialPrivatization(e.target.checked)
                    }
                  />
                  <label
                    className="form-check-label"
                    htmlFor="partialPrivatizationOption"
                    style={{
                      fontSize: "14px",
                      color: "#374151",
                      fontWeight: 500,
                    }}
                  >
                    <Icon
                      icon="ri:shield-user-line"
                      width={16}
                      style={{ marginRight: "4px", color: "#8B5CF6" }}
                    />
                    Privatisation partielle
                    <small
                      className="text-muted d-block"
                      style={{ fontSize: "12px", marginLeft: "20px" }}
                    >
                      Ne pas créer de fermeture exceptionnelle sur le site (le
                      lieu reste ouvert au public)
                    </small>
                  </label>
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label
                className="form-label"
                style={{
                  fontWeight: 600,
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                Statut de paiement
              </label>
              <select
                name="paymentStatus"
                className="form-select"
                required
                style={{ borderRadius: "8px" }}
                onChange={(e) => setPaymentType(e.target.value)}
                defaultValue="unpaid"
              >
                <option value="unpaid">Non payé</option>
                <option value="paid">Payé</option>
                <option value="partial">Partiel</option>
              </select>
            </div>

            {paymentType === "partial" && (
              <div className="col-md-6">
                <label
                  className="form-label"
                  style={{
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#374151",
                  }}
                >
                  Montant payé (€)
                </label>
                <input
                  type="number"
                  name="amountPaid"
                  className="form-control"
                  step="0.01"
                  min="0"
                  required
                  style={{ borderRadius: "8px" }}
                  placeholder="0.00"
                />
              </div>
            )}
          </div>

          <div className="d-flex gap-2 mt-4">
            <Button
              type="submit"
              style={{
                background: "#667eea",
                border: "none",
                borderRadius: "8px",
                padding: "0.5rem 1.5rem",
                fontWeight: 500,
              }}
            >
              Créer la réservation
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setShowCreateModal(false);
                setIsPendingStatus(false);
                setPaymentType("unpaid");
                setIsPartialPrivatization(false);
              }}
              style={{
                borderRadius: "8px",
                padding: "0.5rem 1.5rem",
                fontWeight: 500,
              }}
            >
              Annuler
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateReservationModal;
