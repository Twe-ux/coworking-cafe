"use client";

import { calculateDuration, formatDuration } from "@/lib/utils/planning";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { Alert, Button, Card, Col, Form, Modal, Row } from "react-bootstrap";

// ShiftType interface
interface ShiftType {
  _id?: string;
  name: string;
  startTime: string;
  endTime: string;
  order?: number;
}

// Types
interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeRole: string;
  availability?: {
    monday: { available: boolean; slots: Array<{ start: string; end: string }> };
    tuesday: { available: boolean; slots: Array<{ start: string; end: string }> };
    wednesday: { available: boolean; slots: Array<{ start: string; end: string }> };
    thursday: { available: boolean; slots: Array<{ start: string; end: string }> };
    friday: { available: boolean; slots: Array<{ start: string; end: string }> };
    saturday: { available: boolean; slots: Array<{ start: string; end: string }> };
    sunday: { available: boolean; slots: Array<{ start: string; end: string }> };
  };
}

interface Shift {
  _id: string;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeRole: string;
  };
  date: string;
  startTime: string;
  endTime: string;
}

interface EmployeeSchedulingProps {
  employees: Employee[];
  onShiftsChange?: (shifts: Shift[]) => void;
  onDateChange?: (date: Date) => void;
}

// Color palette for employees
const EMPLOYEE_COLORS = [
  "#4F46E5", // Indigo
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#EC4899", // Pink
  "#F97316", // Orange
];

export default function EmployeeScheduling({
  employees,
  onShiftsChange,
  onDateChange,
}: EmployeeSchedulingProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Date navigation
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [shiftData, setShiftData] = useState({
    startTime: "09:00",
    endTime: "17:00",
  });
  const [selectedShiftType, setSelectedShiftType] = useState<string | null>(
    null
  );
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);

  // Settings state (inline)
  const [showSettings, setShowSettings] = useState(false);
  const [editingShiftTypeId, setEditingShiftTypeId] = useState<string | null>(
    null
  );

  // Availability display toggle
  const [showAvailability, setShowAvailability] = useState(true);

  useEffect(() => {
    loadShifts();
    loadShiftTypes();
  }, []);

  // Notify parent component when shifts change
  useEffect(() => {
    if (onShiftsChange) {
      onShiftsChange(shifts);
    }
  }, [shifts, onShiftsChange]);

  // Notify parent component when currentDate changes
  useEffect(() => {
    if (onDateChange) {
      onDateChange(currentDate);
    }
  }, [currentDate, onDateChange]);

  const loadShiftTypes = async () => {
    try {
      const response = await fetch("/api/hr/shift-types");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des shift types");
      }
      const data = await response.json();
      setShiftTypes(data.shiftTypes || []);
    } catch (error) {
    }
  };

  const loadShifts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/hr/shifts");

      if (!response.ok) {
        throw new Error("Erreur lors du chargement des shifts");
      }

      const data = await response.json();
      setShifts(data.shifts || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Get employee color
  const getEmployeeColor = (employeeId: string) => {
    const index = employees.findIndex((emp) => emp._id === employeeId);
    return EMPLOYEE_COLORS[index % EMPLOYEE_COLORS.length];
  };

  // Generate calendar days for the current month
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    // Adjust to make Monday = 0
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7;

    // Calculate days to show from previous month
    const daysFromPrevMonth = firstDayOfWeek;

    // Calculate total cells needed (must be multiple of 7)
    const totalDays = lastDay.getDate();
    const totalCells = Math.ceil((daysFromPrevMonth + totalDays) / 7) * 7;

    const days: Date[] = [];

    for (let i = 0; i < totalCells; i++) {
      const date = new Date(year, month, 1 - daysFromPrevMonth + i);
      days.push(date);
    }

    return days;
  };

  // Group days into weeks
  const getWeeks = () => {
    const days = getCalendarDays();
    const weeks: Date[][] = [];

    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  };

  // Get shifts for a specific date and employee
  const getShiftsForDateAndEmployee = (date: Date, employeeId: string) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return shifts.filter(
      (shift) =>
        shift.date.split("T")[0] === dateStr &&
        shift.employeeId._id === employeeId
    );
  };

  // Split shifts into morning and afternoon based on 14:30 pivot
  const splitShiftsByTime = (shifts: Shift[]) => {
    const morning: Shift[] = [];
    const afternoon: Shift[] = [];

    shifts.forEach((shift) => {
      // Parse start time as hours and minutes
      const [startHour, startMinute] = shift.startTime.split(":").map(Number);
      const startInMinutes = startHour * 60 + startMinute;
      const pivotInMinutes = 14 * 60 + 30; // 14:30

      if (startInMinutes < pivotInMinutes) {
        morning.push(shift);
      } else {
        afternoon.push(shift);
      }
    });

    return { morning, afternoon };
  };

  // Calculate weekly hours for an employee in a specific week
  const calculateWeeklyHours = (employeeId: string, weekDays: Date[]) => {
    let totalMinutes = 0;

    weekDays.forEach((date) => {
      const dayShifts = getShiftsForDateAndEmployee(date, employeeId);
      dayShifts.forEach((shift) => {
        // calculateDuration retourne des heures, on convertit en minutes
        const durationInHours = calculateDuration(
          shift.startTime,
          shift.endTime
        );
        totalMinutes += durationInHours * 60;
      });
    });

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes.toString().padStart(2, "0")}`;
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Get availability slots for a specific date and period
  const getAvailabilitySlots = (employee: Employee, date: Date, period: 'morning' | 'afternoon') => {
    if (!employee.availability) return [];

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[date.getDay()] as keyof typeof employee.availability;
    const dayAvailability = employee.availability[dayName];

    if (!dayAvailability || !dayAvailability.available || !dayAvailability.slots.length) {
      return [];
    }

    const pivotInMinutes = 14 * 60 + 30; // 14:30

    return dayAvailability.slots.filter((slot) => {
      const [startHour, startMinute] = slot.start.split(':').map(Number);
      const [endHour, endMinute] = slot.end.split(':').map(Number);
      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;

      if (period === 'morning') {
        // Include slot if it overlaps with morning (before 14:30)
        return startInMinutes < pivotInMinutes;
      } else {
        // Include slot if it overlaps with afternoon (from 14:30)
        return endInMinutes > pivotInMinutes;
      }
    });
  };

  // Month navigation
  const goToPreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  // Format month/year
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  };

  // Handle shift type selection - Auto save when clicking a preset
  const handleShiftTypeSelect = async (shiftType: ShiftType) => {
    setSelectedShiftType(shiftType._id || null);
    const newShiftData = {
      startTime: shiftType.startTime,
      endTime: shiftType.endTime,
    };
    setShiftData(newShiftData);

    // Auto-save if employee and date are selected
    if (selectedEmployee && selectedDate) {
      await handleSaveShift(newShiftData);
    }
  };

  // Open modal for creating shift
  const handleDateClick = (date: Date) => {
    setEditingShift(null);
    // Format date in local timezone (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    setSelectedDate(`${year}-${month}-${day}`);
    // Ne pas réinitialiser selectedEmployee - garder la dernière sélection
    // setSelectedEmployee("");
    setShiftData({ startTime: "09:00", endTime: "17:00" });
    setSelectedShiftType(null);
    setShowModal(true);
  };

  // Open modal for editing shift
  const handleShiftClick = (shift: Shift, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingShift(shift);
    setSelectedEmployee(shift.employeeId._id);
    setSelectedDate(shift.date.split("T")[0]);
    setShiftData({
      startTime: shift.startTime,
      endTime: shift.endTime,
    });
    setShowModal(true);
  };

  // Save shift (create or update)
  const handleSaveShift = async (customShiftData?: {
    startTime: string;
    endTime: string;
  }) => {
    if (!selectedEmployee || !selectedDate) {
      alert("Veuillez sélectionner un employé et une date");
      return;
    }

    const dataToSave = customShiftData || shiftData;

    // Validation - s'assurer que les heures sont bien présentes
    if (!dataToSave.startTime || !dataToSave.endTime) {
      alert("Veuillez saisir les heures de début et de fin");
      return;
    }

    setLoading(true);
    try {
      const url = editingShift
        ? `/api/hr/shifts/${editingShift._id}`
        : "/api/hr/shifts";

      const method = editingShift ? "PUT" : "POST";

      const body = editingShift
        ? {
            startTime: dataToSave.startTime,
            endTime: dataToSave.endTime,
          }
        : {
            employeeId: selectedEmployee,
            date: selectedDate,
            startTime: dataToSave.startTime,
            endTime: dataToSave.endTime,
          };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la sauvegarde");
      }

      await loadShifts();
      setShowModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete shift
  const handleDeleteShift = async () => {
    if (!editingShift) return;

    if (!confirm("Voulez-vous vraiment supprimer ce shift ?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/hr/shifts/${editingShift._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      await loadShifts();
      setShowModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update shift type and auto-save
  const handleUpdateShiftType = async (
    id: string,
    field: keyof ShiftType,
    value: string
  ) => {
    // Update locally first for responsive UI
    const updated = shiftTypes.map((st) =>
      st._id === id ? { ...st, [field]: value } : st
    );
    setShiftTypes(updated);

    // Save to database
    try {
      const shiftType = shiftTypes.find((st) => st._id === id);
      if (!shiftType) return;

      const response = await fetch(`/api/hr/shift-types/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...shiftType,
          [field]: value,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }
    } catch (err: any) {
      alert(err.message);
      loadShiftTypes(); // Reload on error
    }
  };

  // Delete shift type
  const handleDeleteShiftType = async (id: string) => {
    if (!confirm("Supprimer ce type de shift ?")) return;

    try {
      const response = await fetch(`/api/hr/shift-types/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      loadShiftTypes();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add new shift type
  const handleAddShiftType = async () => {
    try {
      const response = await fetch("/api/hr/shift-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Shift",
          startTime: "09:00",
          endTime: "17:00",
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création");
      }

      const data = await response.json();
      loadShiftTypes();
      setEditingShiftTypeId(data.shiftType._id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const weeks = getWeeks();

  return (
    <Card>
      <Card.Body>
        {/* Header with month navigation */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={goToPreviousMonth}
            >
              <Icon icon="eva:arrow-ios-back-fill" />
            </Button>
            <h4 className="mb-0 text-capitalize">{formatMonthYear()}</h4>
            <Button variant="outline-secondary" size="sm" onClick={goToNextMonth}>
              <Icon icon="eva:arrow-ios-forward-fill" />
            </Button>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Form.Check
              type="switch"
              id="show-availability-switch"
              label="Afficher les disponibilités"
              checked={showAvailability}
              onChange={(e) => setShowAvailability(e.target.checked)}
            />
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Calendar Grid */}
        <div className="d-flex gap-3">
          {/* Staff Column */}
          <div
            style={{
              width: "150px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "1px",
              backgroundColor: "#6c757d",
              border: "1px solid #6c757d",
              borderRadius: "0.25rem",
            }}
          >
            {/* Staff Header */}
            <div
              className=" text-center fw-medium p-2"
              style={{
                minHeight: "40px",
                backgroundColor: "#f8f9fa",
                borderRadius: "3px 3px 0 0",
              }}
            >
              Staff
            </div>

            {/* Staff rows per week */}
            {weeks.map((weekDays, weekIndex) => (
              <div
                key={weekIndex}
                className="border  p-2"
                style={{
                  minHeight: "120px",
                  backgroundColor: "#f8f9fa",
                }}
              >
                <div style={{ height: "24px" }}></div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  {employees.map((employee) => {
                    const weeklyHours = calculateWeeklyHours(
                      employee._id,
                      weekDays
                    );
                    const color = getEmployeeColor(employee._id);

                    return (
                      <div
                        key={employee._id}
                        className="d-flex justify-content-between align-items-center text-white rounded"
                        style={{
                          backgroundColor: color,
                          fontSize: "0.65rem",
                          fontWeight: 500,
                          minHeight: "25px",
                          padding: "2px 8px",
                          gap: "8px",
                        }}
                      >
                        <span className="text-truncate flex-grow-1">
                          {employee.firstName}
                        </span>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {weeklyHours}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div
            className="flex-grow-1 "
            style={{ border: "1px solid #6c757d", borderRadius: "0.25rem" }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "1px",
                backgroundColor: "#6c757d",
              }}
            >
              {/* Day Headers */}
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                <div
                  key={day}
                  className="text-center fw-medium p-2"
                  style={{
                    minHeight: "40px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {weeks.map((weekDays) =>
                weekDays.map((date, dayIndex) => {
                  const isCurrentMonthDay = isCurrentMonth(date);
                  const isTodayDay = isToday(date);

                  return (
                    <div
                      key={`${date.toISOString()}`}
                      className="p-2 position-relative"
                      style={{
                        minHeight: "120px",
                        backgroundColor: isCurrentMonthDay
                          ? "white"
                          : "#f8f9fa",
                        color: isCurrentMonthDay ? "inherit" : "#6c757d",
                        cursor: "pointer",
                        outline: isTodayDay ? "2px solid #0d6efd" : "none",
                        outlineOffset: "-1px",
                      }}
                      onClick={() => handleDateClick(date)}
                    >
                      <div
                        className="mb-1 fw-medium"
                        style={{
                          fontSize: "0.875rem",
                          color: isTodayDay ? "#0d6efd" : "inherit",
                        }}
                      >
                        {date.getDate()}
                      </div>

                      <div className="d-flex flex-column" style={{ gap: "3px" }}>
                        {employees.map((employee) => {
                          const employeeShifts = getShiftsForDateAndEmployee(
                            date,
                            employee._id
                          );
                          const { morning, afternoon } =
                            splitShiftsByTime(employeeShifts);
                          const color = getEmployeeColor(employee._id);
                          const morningAvailability = getAvailabilitySlots(employee, date, 'morning');
                          const afternoonAvailability = getAvailabilitySlots(employee, date, 'afternoon');

                          return (
                            <div
                              key={employee._id}
                              className="d-flex gap-1"
                              style={{ minHeight: "25px" }}
                            >
                              {/* Morning shifts (before 14:30) - max 2 side by side */}
                              <div
                                style={{
                                  flex: 1,
                                  borderRadius: '3px',
                                }}
                                className="d-flex gap-1"
                              >
                                {morning.length > 0 ? (
                                  morning.slice(0, 2).map((shift) => (
                                    <div
                                      key={shift._id}
                                      className="rounded px-1 py-1 text-white text-center"
                                      style={{
                                        backgroundColor: color,
                                        fontSize: "0.65rem",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        flex: 1,
                                      }}
                                      onClick={(e) => handleShiftClick(shift, e)}
                                      title={`${employee.firstName} - ${shift.startTime} à ${shift.endTime}`}
                                    >
                                      {shift.startTime}-{shift.endTime}
                                    </div>
                                  ))
                                ) : (
                                  showAvailability && morningAvailability.slice(0, 2).map((slot, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded px-1 py-1 text-center"
                                      style={{
                                        backgroundColor: `${color}20`, // 20 = ~12% opacity in hex
                                        color: '#6c757d',
                                        fontSize: "0.6rem",
                                        fontWeight: 400,
                                        flex: 1,
                                      }}
                                      title={`Disponible: ${slot.start} à ${slot.end}`}
                                    >
                                      {slot.start}-{slot.end}
                                    </div>
                                  ))
                                )}
                              </div>

                              {/* Afternoon shifts (after 14:30) - max 2 side by side */}
                              <div
                                style={{
                                  flex: 1,
                                  borderRadius: '3px',
                                }}
                                className="d-flex gap-1"
                              >
                                {afternoon.length > 0 ? (
                                  afternoon.slice(0, 2).map((shift) => (
                                    <div
                                      key={shift._id}
                                      className="rounded px-1 py-1 text-white text-center"
                                      style={{
                                        backgroundColor: color,
                                        fontSize: "0.65rem",
                                        fontWeight: 500,
                                        cursor: "pointer",
                                        flex: 1,
                                      }}
                                      onClick={(e) => handleShiftClick(shift, e)}
                                      title={`${employee.firstName} - ${shift.startTime} à ${shift.endTime}`}
                                    >
                                      {shift.startTime}-{shift.endTime}
                                    </div>
                                  ))
                                ) : (
                                  showAvailability && afternoonAvailability.slice(0, 2).map((slot, idx) => (
                                    <div
                                      key={idx}
                                      className="rounded px-1 py-1 text-center"
                                      style={{
                                        backgroundColor: `${color}20`, // 20 = ~12% opacity in hex
                                        color: '#6c757d',
                                        fontSize: "0.6rem",
                                        fontWeight: 400,
                                        flex: 1,
                                      }}
                                      title={`Disponible: ${slot.start} à ${slot.end}`}
                                    >
                                      {slot.start}-{slot.end}
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal for create/edit shift */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingShift ? "Modifier le shift" : "Créer un shift"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              {/* Date Display */}
              <div className="mb-4 p-3 bg-light rounded">
                <div className="d-flex align-items-center">
                  <Icon icon="eva:calendar-outline" className="me-2" />
                  <span>
                    {new Date(selectedDate).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {/* Employee Selection - Buttons */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  Employee <span className="text-danger">*</span>
                </Form.Label>
                <div className="d-flex gap-2 flex-wrap">
                  {employees.map((emp) => {
                    const color = getEmployeeColor(emp._id);
                    const isSelected = selectedEmployee === emp._id;

                    return (
                      <Button
                        key={emp._id}
                        onClick={() => setSelectedEmployee(emp._id)}
                        disabled={!!editingShift}
                        style={{
                          backgroundColor: isSelected ? color : "transparent",
                          borderColor: color,
                          color: isSelected ? "white" : color,
                          fontWeight: 500,
                        }}
                      >
                        {emp.firstName}
                      </Button>
                    );
                  })}
                </div>
              </Form.Group>

              {/* Shift Type Selection */}
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="fw-bold mb-0">Shift Type</Form.Label>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Icon icon="eva:settings-outline" className="me-1" />
                    Settings
                  </Button>
                </div>

                {/* Settings Panel (Inline) */}
                {showSettings && (
                  <div
                    className="mb-3 p-3 border rounded"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <h6 className="mb-3">Manage Shift Types</h6>
                    {shiftTypes.map((shiftType) => {
                      const isEditing = editingShiftTypeId === shiftType._id;

                      return (
                        <div
                          key={shiftType._id}
                          className="d-flex align-items-center gap-2 mb-2 p-2 bg-white rounded border"
                        >
                          <span style={{ fontSize: "1.2rem" }}>🌅</span>
                          {isEditing ? (
                            <>
                              <Form.Control
                                size="sm"
                                type="text"
                                value={shiftType.name}
                                onChange={(e) =>
                                  handleUpdateShiftType(
                                    shiftType._id!,
                                    "name",
                                    e.target.value
                                  )
                                }
                                style={{ width: "100px" }}
                              />
                              <Form.Control
                                size="sm"
                                type="time"
                                value={shiftType.startTime}
                                onChange={(e) =>
                                  handleUpdateShiftType(
                                    shiftType._id!,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                                style={{ width: "90px" }}
                              />
                              <span>-</span>
                              <Form.Control
                                size="sm"
                                type="time"
                                value={shiftType.endTime}
                                onChange={(e) =>
                                  handleUpdateShiftType(
                                    shiftType._id!,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                                style={{ width: "90px" }}
                              />
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => setEditingShiftTypeId(null)}
                              >
                                ✓
                              </Button>
                            </>
                          ) : (
                            <>
                              <strong style={{ minWidth: "80px" }}>
                                {shiftType.name}
                              </strong>
                              <span className="text-muted">
                                {shiftType.startTime} - {shiftType.endTime}
                              </span>
                              <div className="ms-auto d-flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline-primary"
                                  onClick={() =>
                                    setEditingShiftTypeId(shiftType._id!)
                                  }
                                >
                                  <Icon icon="eva:edit-outline" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  onClick={() =>
                                    handleDeleteShiftType(shiftType._id!)
                                  }
                                >
                                  <Icon icon="eva:trash-2-outline" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100 mt-2"
                      onClick={handleAddShiftType}
                    >
                      <Icon icon="eva:plus-outline" className="me-1" />
                      Add New Shift Type
                    </Button>
                  </div>
                )}

                {/* Shift Type Cards */}
                <Row className="g-2">
                  {shiftTypes.map((shiftType) => {
                    const isSelected = selectedShiftType === shiftType._id;

                    return (
                      <Col key={shiftType._id} xs={6}>
                        <div
                          className="p-3 rounded border cursor-pointer"
                          style={{
                            borderWidth: isSelected ? "2px" : "1px",
                            borderColor: isSelected ? "#0d6efd" : "#dee2e6",
                            backgroundColor: isSelected ? "#e7f1ff" : "white",
                            cursor: "pointer",
                          }}
                          onClick={() => handleShiftTypeSelect(shiftType)}
                        >
                          <div className="fw-bold">{shiftType.name}</div>
                          <div className="small text-muted">
                            {shiftType.startTime} - {shiftType.endTime}
                          </div>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </div>

              {/* Manual Time Entry */}
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      Start Time <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="time"
                      value={shiftData.startTime}
                      onChange={(e) => {
                        setShiftData({
                          ...shiftData,
                          startTime: e.target.value,
                        });
                        setSelectedShiftType(null);
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      End Time <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="time"
                      value={shiftData.endTime}
                      onChange={(e) => {
                        setShiftData({ ...shiftData, endTime: e.target.value });
                        setSelectedShiftType(null);
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Duration Display */}
              {shiftData.startTime && shiftData.endTime && (
                <div className="p-3 bg-light rounded d-flex align-items-center">
                  <Icon
                    icon="eva:clock-outline"
                    className="me-2 text-primary"
                  />
                  <span className="text-primary fw-bold">
                    Duration:{" "}
                    {formatDuration(
                      calculateDuration(shiftData.startTime, shiftData.endTime)
                    )}
                  </span>
                </div>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            {editingShift && (
              <Button
                variant="danger"
                onClick={handleDeleteShift}
                disabled={loading}
                className="me-auto"
              >
                <Icon icon="eva:trash-2-outline" className="me-1" />
                Supprimer
              </Button>
            )}
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSaveShift()}
              disabled={loading}
            >
              {loading ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
}
