"use client";

import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { WeekCard } from "@/components/employee-scheduling/scheduling/WeekCard";
import type { Employee } from "@/types/hr";
import type { Shift } from "@/types/shift";
import { StyledAlert } from "@/components/ui/styled-alert";

interface AvailabilityWeekCardProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  requestingEmployeeId: string;
}

export function AvailabilityWeekCard({
  startDate,
  endDate,
  requestingEmployeeId
}: AvailabilityWeekCardProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [virtualShifts, setVirtualShifts] = useState<Shift[]>([]);
  const [weekStart, setWeekStart] = useState<Date>(new Date());
  const [weekEnd, setWeekEnd] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch employees
        const response = await fetch('/api/hr/employees?status=active');
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Erreur');
        }

        // Filtrer pour exclure le compte admin/dev
        const employeesList: Employee[] = (result.data || []).filter(
          (emp: Employee) => emp.firstName.toLowerCase() !== 'admin'
        );
        setEmployees(employeesList);

        // Calculate week boundaries
        const monday = getWeekStart(startDate);
        const sunday = new Date(monday);
        sunday.setDate(sunday.getDate() + 6);
        setWeekStart(monday);
        setWeekEnd(sunday);

        // Convert availability to virtual shifts for display
        const shifts: Shift[] = [];

        for (let i = 0; i < 7; i++) {
          const currentDate = new Date(monday);
          currentDate.setDate(currentDate.getDate() + i);
          const dateStr = currentDate.toISOString().split('T')[0];

          employeesList.forEach(employee => {
            const dayKey = getDayKey(currentDate);
            const dayAvailability = employee.availability?.[dayKey];
            const slots = dayAvailability?.slots || [];

            // Check if this date is in requested range
            const isRequested = dateStr >= startDate && dateStr <= endDate && employee.id === requestingEmployeeId;

            slots.forEach((slot, idx) => {
              shifts.push({
                _id: `${employee.id}-${dateStr}-${idx}`,
                id: `${employee.id}-${dateStr}-${idx}`,
                employeeId: employee.id,
                date: currentDate,
                startTime: slot.start,
                endTime: slot.end,
                type: slot.start < '14:30' ? 'morning' : 'afternoon',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                // Override color if requested unavailability
                ...(isRequested && { _unavailabilityRequested: true })
              } as any);
            });
          });
        }

        setVirtualShifts(shifts);
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Erreur');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [startDate, endDate, requestingEmployeeId]);

  function getWeekStart(dateStr: string): Date {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diff);
    return monday;
  }

  function getDayKey(date: Date): 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' {
    const keys: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'> = [
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ];
    const dayOfWeek = date.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    return keys[adjustedDay];
  }

  // Custom getShiftsPositionedByEmployee that handles unavailability color override
  const getShiftsPositionedByEmployee = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayShifts = virtualShifts.filter(s => {
      const shiftDate = new Date(s.date);
      return shiftDate.toISOString().split('T')[0] === dateStr;
    });

    return employees.map(employee => {
      const employeeShifts = dayShifts.filter(s => s.employeeId === employee.id);
      const morningShifts = employeeShifts.filter(s => s.type === 'morning');
      const afternoonShifts = employeeShifts.filter(s => s.type === 'afternoon');

      return {
        employee,
        shifts: employeeShifts,
        morningShifts,
        afternoonShifts
      };
    });
  };

  const calculateWeeklyHours = (employeeId: string, weekStart: Date, weekEnd: Date) => {
    const employeeShifts = virtualShifts.filter(s => s.employeeId === employeeId);

    return employeeShifts.reduce((total, shift) => {
      const [startH, startM] = shift.startTime.split(':').map(Number);
      const [endH, endM] = shift.endTime.split(':').map(Number);
      const hours = (endH * 60 + endM - startH * 60 - startM) / 60;
      return total + hours;
    }, 0);
  };

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (error) {
    return (
      <StyledAlert variant="destructive">
        {error}
      </StyledAlert>
    );
  }

  const week = {
    weekStart,
    weekEnd,
    shifts: virtualShifts
  };

  return (
    <WeekCard
      week={week}
      employees={employees}
      getShiftsPositionedByEmployee={getShiftsPositionedByEmployee}
      calculateWeeklyHours={calculateWeeklyHours}
      showHours={false}
    />
  );
}
