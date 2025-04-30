import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../pages/UserDashboard.css";

export default function InstallmentCalendar({
  installments,
  selectedDate,
  onDateChange,
}) {
  const tileContent = ({ date, view }) => {
    if (view === "month") {
      const hasInst = installments.some(
        (inst) => new Date(inst.due_date).toDateString() === date.toDateString()
      );
      return hasInst ? <div className="calendar-dot" /> : null;
    }
  };

  return (
    <Calendar
      onClickDay={onDateChange}
      value={selectedDate}
      tileContent={tileContent}
    />
  );
}
