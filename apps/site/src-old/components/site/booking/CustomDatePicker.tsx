'use client';

import { useState, useEffect } from 'react';

interface CustomDatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  reservationType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  endDate?: string;
}

export default function CustomDatePicker({
  selectedDate,
  onDateChange,
  minDate,
  maxDate,
  reservationType,
  endDate,
}: CustomDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);

  useEffect(() => {
    if (selectedDate) {
      // Parse date manually to avoid timezone issues
      const [year, month, day] = selectedDate.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      setCurrentMonth(new Date(year, month - 1, 1));
      setSelectedStart(date);
    }
  }, [selectedDate]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    // Create date at noon to avoid timezone issues
    const firstDay = new Date(year, month, 1, 12, 0, 0);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = firstDay.getDay();
    // Convert to Monday = 0, Sunday = 6
    const startingDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const isDateInRange = (date: Date) => {
    if (!selectedStart || !endDate) return false;
    // Parse endDate manually to avoid timezone issues
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const end = new Date(endYear, endMonth - 1, endDay);
    return date >= selectedStart && date <= end;
  };

  const isDateDisabled = (date: Date) => {
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    // Check minDate
    if (minDate) {
      const [minYear, minMonth, minDay] = minDate.split('-').map(Number);
      const min = new Date(minYear, minMonth - 1, minDay);
      min.setHours(0, 0, 0, 0);
      if (dateToCheck < min) return true;
    }

    // Check maxDate
    if (maxDate) {
      const [maxYear, maxMonth, maxDay] = maxDate.split('-').map(Number);
      const max = new Date(maxYear, maxMonth - 1, maxDay);
      max.setHours(0, 0, 0, 0);
      if (dateToCheck > max) return true;
    }

    return false;
  };

  const handleDateClick = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const clickedDate = new Date(year, month, day);

    if (isDateDisabled(clickedDate)) return;

    // Format date manually to avoid timezone issues
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateChange(dateString);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  // Create array of days including empty slots for alignment
  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="custom-datepicker">
      {/* Header */}
      <div className="datepicker-header">
        <button
          type="button"
          className="datepicker-nav-btn"
          onClick={goToPreviousMonth}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <div className="datepicker-month-year">
          {monthNames[month]} {year}
        </div>
        <button
          type="button"
          className="datepicker-nav-btn"
          onClick={goToNextMonth}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>

      {/* Day names */}
      <div className="datepicker-days-header">
        {dayNames.map((day) => (
          <div key={day} className="datepicker-day-name">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="datepicker-days-grid">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="datepicker-day empty"></div>;
          }

          const date = new Date(year, month, day);
          // Format date manually to avoid timezone issues
          const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const isSelected = dateString === selectedDate;
          const isInRange = isDateInRange(date);
          const isDisabled = isDateDisabled(date);
          // Compare dates without timezone issues
          const today = new Date();
          const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

          return (
            <button
              key={day}
              type="button"
              className={`datepicker-day ${isSelected ? 'selected' : ''} ${
                isInRange ? 'in-range' : ''
              } ${isDisabled ? 'disabled' : ''} ${isToday ? 'today' : ''}`}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Period info for weekly/monthly */}
      {(reservationType === 'weekly' || reservationType === 'monthly') && endDate && selectedDate && (
        <div className="datepicker-period-info">
          <i className="bi bi-calendar-range me-2"></i>
          <strong>Période sélectionnée :</strong>
          <div className="mt-1">
            {(() => {
              const [year, month, day] = selectedDate.split('-').map(Number);
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
            })()}
            {' → '}
            {(() => {
              const [year, month, day] = endDate.split('-').map(Number);
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              });
            })()}
          </div>
          <div className="text-muted small mt-1">
            ({reservationType === 'weekly' ? '7 jours' : '30 jours'})
          </div>
        </div>
      )}
    </div>
  );
}
