"use client";

import { useState } from "react";
import EmployeeScheduling from "./EmployeeScheduling";
import EmployeeMonthlyStats from "./EmployeeMonthlyStats";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeRole: string;
  contractualHours: number;
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

interface ScheduleWrapperProps {
  employees: Employee[];
}

export default function ScheduleWrapper({ employees }: ScheduleWrapperProps) {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <>
      <EmployeeScheduling
        employees={employees}
        onShiftsChange={setShifts}
        onDateChange={setCurrentDate}
      />
      <EmployeeMonthlyStats
        employees={employees}
        shifts={shifts}
        currentDate={currentDate}
      />
    </>
  );
}
