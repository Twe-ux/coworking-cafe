import { Icon } from "@iconify/react";
import { Button, Modal } from "react-bootstrap";

interface Reservation {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  spaceType: string;
  date: string;
  startTime?: string;
  endTime?: string;
  numberOfPeople: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  attendanceStatus?: "present" | "absent";
  paymentStatus: string;
  contactName?: string;
  contactEmail?: string;
}

interface EditReservationModalProps {
  show: boolean;
  onHide: () => void;
  selectedEvent: Reservation | null;
  isEditMode: boolean;
  setIsEditMode: (value: boolean) => void;
  editForm: any;
  spaceTypeColors: Record<string, string>;
  spaceTypeLabels: Record<string, string>;
  statusLabels: Record<string, string>;
  formatDate: (dateString: string) => string;
  handleEditClick: () => void;
  handleEditFormChange: (field: string, value: any) => void;
  handleSaveEdit: () => void;
  updateReservationStatus: (
    id: string,
    status: string,
    paymentStatus?: string,
    attendanceStatus?: string
  ) => void;
}

const EditReservationModal: React.FC<EditReservationModalProps> = ({
  show,
  onHide,
  selectedEvent,
  isEditMode,
  setIsEditMode,
  editForm,
  spaceTypeColors,
  spaceTypeLabels,
  statusLabels,
  formatDate,
  handleEditClick,
  handleEditFormChange,
  handleSaveEdit,
  updateReservationStatus,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      style={{ borderRadius: "16px" }}
    >
      <Modal.Header
        closeButton
        className="border-0 pb-2"
        style={{ padding: "1.5rem 1.75rem 0" }}
      >
        <Modal.Title
          style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1F2937" }}
        >
          {isEditMode
            ? "Modifier la réservation"
            : "Détails de la réservation"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: "1.75rem" }}>
        {selectedEvent && !isEditMode && (
          <div>
            {/* Header Card */}
            <div
              className="mb-4 p-4"
              style={{
                background: `${spaceTypeColors[selectedEvent.spaceType]}08`,
                borderRadius: "12px",
                border: `1px solid ${
                  spaceTypeColors[selectedEvent.spaceType]
                }20`,
              }}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-2">
                    <Icon
                      icon="ri:user-3-fill"
                      width={24}
                      style={{
                        color: spaceTypeColors[selectedEvent.spaceType],
                        marginRight: "10px",
                      }}
                    />
                    <h5
                      className="mb-0"
                      style={{ fontWeight: 600, color: "#1F2937" }}
                    >
                      {selectedEvent.contactName || selectedEvent.user.name}
                    </h5>
                  </div>
                  <div
                    className="d-flex align-items-center text-muted"
                    style={{ fontSize: "0.9375rem" }}
                  >
                    <Icon icon="ri:mail-line" width={16} className="me-2" />
                    {selectedEvent.contactEmail || selectedEvent.user.email}
                  </div>
                </div>
                <div
                  className="px-4 py-2"
                  style={{
                    background: spaceTypeColors[selectedEvent.spaceType],
                    color: "white",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {spaceTypeLabels[selectedEvent.spaceType] ||
                    selectedEvent.spaceType}
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="row g-3">
              <div className="col-md-6">
                <div
                  className="p-4 h-100"
                  style={{
                    background: "#F9FAFB",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#4F46E510",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                      }}
                    >
                      <Icon
                        icon="ri:calendar-line"
                        width={20}
                        style={{ color: "#4F46E5" }}
                      />
                    </div>
                    <h6
                      className="mb-0"
                      style={{ fontWeight: 600, color: "#374151" }}
                    >
                      Date et heure
                    </h6>
                  </div>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: "#1F2937",
                      marginBottom: "4px",
                    }}
                  >
                    {formatDate(selectedEvent.date)}
                  </div>
                  <div style={{ fontSize: "0.9375rem", color: "#6B7280" }}>
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div
                  className="p-4 h-100"
                  style={{
                    background: "#F9FAFB",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#06B6D410",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                      }}
                    >
                      <Icon
                        icon="ri:group-line"
                        width={20}
                        style={{ color: "#06B6D4" }}
                      />
                    </div>
                    <h6
                      className="mb-0"
                      style={{ fontWeight: 600, color: "#374151" }}
                    >
                      Participants
                    </h6>
                  </div>
                  <div
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#1F2937",
                    }}
                  >
                    {selectedEvent.numberOfPeople}
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#6B7280" }}>
                    personne{selectedEvent.numberOfPeople > 1 ? "s" : ""}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div
                  className="p-4 h-100"
                  style={{
                    background: "#F9FAFB",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#10B98110",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                      }}
                    >
                      <Icon
                        icon="ri:money-euro-circle-line"
                        width={20}
                        style={{ color: "#10B981" }}
                      />
                    </div>
                    <h6
                      className="mb-0"
                      style={{ fontWeight: 600, color: "#374151" }}
                    >
                      Prix total
                    </h6>
                  </div>
                  <div
                    style={{
                      fontSize: "1.875rem",
                      fontWeight: 700,
                      color: "#10B981",
                    }}
                  >
                    {selectedEvent.totalPrice.toFixed(2)}€
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div
                  className="p-4 h-100"
                  style={{
                    background: "#F9FAFB",
                    borderRadius: "12px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <div className="d-flex align-items-center mb-3">
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        background: "#F59E0B10",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: "12px",
                      }}
                    >
                      <Icon
                        icon="ri:checkbox-circle-line"
                        width={20}
                        style={{ color: "#F59E0B" }}
                      />
                    </div>
                    <h6
                      className="mb-0"
                      style={{ fontWeight: 600, color: "#374151" }}
                    >
                      Statut
                    </h6>
                  </div>
                  <div className="d-flex flex-column gap-2">
                    <div
                      className="d-inline-flex align-items-center px-3 py-2 rounded-pill"
                      style={{
                        background:
                          selectedEvent.status === "confirmed"
                            ? "#10B98115"
                            : selectedEvent.status === "pending"
                            ? "#F59E0B15"
                            : selectedEvent.status === "completed"
                            ? "#6366F115"
                            : "#EF444415",
                        border: `1px solid ${
                          selectedEvent.status === "confirmed"
                            ? "#10B98130"
                            : selectedEvent.status === "pending"
                            ? "#F59E0B30"
                            : selectedEvent.status === "completed"
                            ? "#6366F130"
                            : "#EF444430"
                        }`,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        width: "fit-content",
                      }}
                    >
                      <Icon
                        icon={
                          selectedEvent.status === "confirmed"
                            ? "ri:checkbox-circle-fill"
                            : selectedEvent.status === "pending"
                            ? "ri:time-line"
                            : selectedEvent.status === "completed"
                            ? "ri:check-double-line"
                            : "ri:close-circle-fill"
                        }
                        width={14}
                        className="me-2"
                        style={{
                          color:
                            selectedEvent.status === "confirmed"
                              ? "#10B981"
                              : selectedEvent.status === "pending"
                              ? "#F59E0B"
                              : selectedEvent.status === "completed"
                              ? "#6366F1"
                              : "#EF4444",
                        }}
                      />
                      {statusLabels[selectedEvent.status]}
                    </div>
                    <div
                      className="d-inline-flex align-items-center px-3 py-2 rounded-pill"
                      style={{
                        background:
                          selectedEvent.paymentStatus === "paid"
                            ? "#10B98115"
                            : selectedEvent.paymentStatus === "pending"
                            ? "#F59E0B15"
                            : "#EF444415",
                        border: `1px solid ${
                          selectedEvent.paymentStatus === "paid"
                            ? "#10B98130"
                            : selectedEvent.paymentStatus === "pending"
                            ? "#F59E0B30"
                            : "#EF444430"
                        }`,
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        width: "fit-content",
                      }}
                    >
                      <Icon
                        icon="ri:wallet-3-line"
                        width={14}
                        className="me-2"
                        style={{
                          color:
                            selectedEvent.paymentStatus === "paid"
                              ? "#10B981"
                              : selectedEvent.paymentStatus === "pending"
                              ? "#F59E0B"
                              : "#EF4444",
                        }}
                      />
                      {selectedEvent.paymentStatus}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {selectedEvent && isEditMode && editForm && (
          <div>
            <form>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Type d&apos;espace
                  </label>
                  <select
                    className="form-select"
                    value={editForm.spaceType}
                    onChange={(e) =>
                      handleEditFormChange("spaceType", e.target.value)
                    }
                  >
                    {Object.entries(spaceTypeLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Nombre de personnes
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={editForm.numberOfPeople}
                    onChange={(e) =>
                      handleEditFormChange(
                        "numberOfPeople",
                        parseInt(e.target.value)
                      )
                    }
                    min="1"
                  />
                </div>

                <div className="col-md-12">
                  <label className="form-label fw-semibold">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={editForm.date}
                    onChange={(e) =>
                      handleEditFormChange("date", e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Heure de début
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    value={editForm.startTime}
                    onChange={(e) =>
                      handleEditFormChange("startTime", e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Heure de fin
                  </label>
                  <input
                    type="time"
                    className="form-control"
                    value={editForm.endTime}
                    onChange={(e) =>
                      handleEditFormChange("endTime", e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Nom du contact
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={editForm.contactName}
                    onChange={(e) =>
                      handleEditFormChange("contactName", e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Email du contact
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={editForm.contactEmail}
                    onChange={(e) =>
                      handleEditFormChange("contactEmail", e.target.value)
                    }
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Statut</label>
                  <select
                    className="form-select"
                    value={editForm.status}
                    onChange={(e) =>
                      handleEditFormChange("status", e.target.value)
                    }
                  >
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="completed">Terminée</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Statut de paiement
                  </label>
                  <select
                    className="form-select"
                    value={editForm.paymentStatus}
                    onChange={(e) =>
                      handleEditFormChange("paymentStatus", e.target.value)
                    }
                  >
                    <option value="unpaid">Non payé</option>
                    <option value="partial">Partiel</option>
                    <option value="paid">Payé</option>
                  </select>
                </div>

                <div className="col-md-12">
                  <div
                    className="p-3 rounded"
                    style={{
                      background: "#F9FAFB",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="fw-semibold text-muted">
                        Prix total calculé:
                      </span>
                      <span
                        className="fs-4 fw-bold"
                        style={{ color: "#10B981" }}
                      >
                        {editForm.totalPrice.toFixed(2)}€
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer
        className="border-0"
        style={{ padding: "0 1.75rem 1.5rem" }}
      >
        {selectedEvent && !isEditMode && (
          <div className="d-flex justify-content-between align-items-center w-100">
            <div className="d-flex gap-2">
              {selectedEvent.status === "pending" && (
                <>
                  <Button
                    onClick={() =>
                      updateReservationStatus(selectedEvent._id, "confirmed")
                    }
                    style={{
                      background: "#10B981",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.5rem 1rem",
                      fontWeight: 500,
                      color: "white",
                    }}
                  >
                    <Icon
                      icon="ri:checkbox-circle-line"
                      width={16}
                      style={{ marginRight: "6px" }}
                    />
                    Confirmer
                  </Button>
                  <Button
                    onClick={() =>
                      updateReservationStatus(selectedEvent._id, "cancelled")
                    }
                    style={{
                      background: "#EF4444",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.5rem 1rem",
                      fontWeight: 500,
                      color: "white",
                    }}
                  >
                    <Icon
                      icon="ri:close-circle-line"
                      width={16}
                      style={{ marginRight: "6px" }}
                    />
                    Annuler
                  </Button>
                </>
              )}
              {selectedEvent.status === "confirmed" && (
                <>
                  <Button
                    onClick={() =>
                      updateReservationStatus(
                        selectedEvent._id,
                        "completed",
                        "paid",
                        "present"
                      )
                    }
                    style={{
                      background: "#10B981",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.5rem 1rem",
                      fontWeight: 500,
                      color: "white",
                    }}
                  >
                    <Icon
                      icon="ri:checkbox-circle-line"
                      width={16}
                      style={{ marginRight: "6px" }}
                    />
                    Présenté
                  </Button>
                  <Button
                    onClick={() =>
                      updateReservationStatus(
                        selectedEvent._id,
                        "completed",
                        "paid",
                        "absent"
                      )
                    }
                    style={{
                      background: "#F59E0B",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.5rem 1rem",
                      fontWeight: 500,
                      color: "white",
                    }}
                  >
                    <Icon
                      icon="ri:close-circle-line"
                      width={16}
                      style={{ marginRight: "6px" }}
                    />
                    Non présenté
                  </Button>
                  <Button
                    onClick={() =>
                      updateReservationStatus(selectedEvent._id, "cancelled")
                    }
                    style={{
                      background: "#EF4444",
                      border: "none",
                      borderRadius: "8px",
                      padding: "0.5rem 1rem",
                      fontWeight: 500,
                      color: "white",
                    }}
                  >
                    <Icon
                      icon="ri:close-circle-line"
                      width={16}
                      style={{ marginRight: "6px" }}
                    />
                    Annuler
                  </Button>
                </>
              )}
              {selectedEvent.status === "cancelled" && (
                <Button
                  onClick={() =>
                    updateReservationStatus(selectedEvent._id, "pending")
                  }
                  style={{
                    background: "#F59E0B",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 1rem",
                    fontWeight: 500,
                    color: "white",
                  }}
                >
                  <Icon
                    icon="ri:restart-line"
                    width={16}
                    style={{ marginRight: "6px" }}
                  />
                  Réactiver
                </Button>
              )}
            </div>
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                onClick={handleEditClick}
                style={{
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  fontWeight: 500,
                }}
              >
                <Icon
                  icon="ri:edit-line"
                  width={16}
                  style={{ marginRight: "6px" }}
                />
                Modifier
              </Button>
              <Button
                variant="outline-secondary"
                onClick={onHide}
                style={{
                  borderRadius: "8px",
                  padding: "0.5rem 1.5rem",
                  fontWeight: 500,
                }}
              >
                Fermer
              </Button>
            </div>
          </div>
        )}

        {selectedEvent && isEditMode && (
          <div className="d-flex justify-content-end gap-2 w-100">
            <Button
              variant="outline-secondary"
              onClick={() => setIsEditMode(false)}
              style={{
                borderRadius: "8px",
                padding: "0.5rem 1.5rem",
                fontWeight: 500,
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveEdit}
              style={{
                background: "#667eea",
                border: "none",
                borderRadius: "8px",
                padding: "0.5rem 1.5rem",
                fontWeight: 500,
                color: "white",
              }}
            >
              <Icon
                icon="ri:save-line"
                width={16}
                style={{ marginRight: "6px" }}
              />
              Enregistrer
            </Button>
          </div>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default EditReservationModal;
