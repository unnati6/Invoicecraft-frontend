import React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "../../calendar-reset.css"
// Custom header with green arrows
const CustomCaption = ({ displayMonth, goToPreviousMonth, goToNextMonth }) => {
  return (
    <div className="flex items-center justify-between px-4 mb-2">
      <button
        onClick={goToPreviousMonth}
        className="h-8 w-8 flex items-center justify-center rounded-full text-green-600 hover:bg-green-200 transition-colors"
        aria-label="Previous month"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <h2 className="text-base font-semibold text-green-800">
        {displayMonth.toLocaleString("default", {
          month: "long",
          year: "numeric",
        })}
      </h2>

      <button
        onClick={goToNextMonth}
        className="h-8 w-8 flex items-center justify-center rounded-full text-green-600 hover:bg-green-200 transition-colors"
        aria-label="Next month"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
};

const ModernCalendar = ({ selected, onSelect }) => {
  return (
    <div className="rounded-xl shadow-md bg-white p-4 w-fit">
      <DayPicker
  mode="single"
  selected={selected}
  onSelect={onSelect}
  showOutsideDays
  components={{ Caption: CustomCaption }}
  classNames={{
    months: "flex justify-center",
    month: "space-y-4",
    head_cell: "text-xs text-green-800 w-10 h-10 text-center font-medium",
    row: "",
    cell: "w-10 h-10 p-0 text-sm text-center",
    day: "w-10 h-10 rounded-full text-green-800 hover:bg-green-100",
   day_selected: "bg-green-600 text-white font-bold hover:bg-green-700",
day_today: "border border-green-600 text-green-800 font-semibold",

    day_outside: "text-gray-300 opacity-50",
  }}
/>

    </div>
  );
};

export default ModernCalendar;
