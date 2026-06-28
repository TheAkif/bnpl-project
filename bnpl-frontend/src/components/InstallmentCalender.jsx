import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../pages/UserDashboard.css";

export default function InstallmentCalendar({ installments, selectedDate, onDateChange }) {
  const tileContent = ({ date, view }) => {
    if (view !== "month") return null;
    const dayInsts = installments.filter(
      inst => new Date(inst.due_date).toDateString() === date.toDateString()
    );
    if (!dayInsts.length) return null;

    const status = dayInsts.some(i => i.status === "late")    ? "late"
                 : dayInsts.some(i => i.status === "pending") ? "pending"
                 : "paid";

    return <div className={`calendar-dot dot-${status}`} />;
  };

  const handleDayClick = date => {
    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      onDateChange(null);
    } else {
      onDateChange(date);
    }
  };

  return <Calendar onClickDay={handleDayClick} value={selectedDate} tileContent={tileContent} />;
}
