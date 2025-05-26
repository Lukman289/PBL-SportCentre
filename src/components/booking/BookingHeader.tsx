"use client";

import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useBookingContext } from "@/context/booking/booking.context";
import { Branch } from "@/types";

interface BookingHeaderProps {
  hideSelectBranch?: boolean;
}

export default function BookingHeader({ hideSelectBranch = false }: BookingHeaderProps) {
  const {
    selectedDate,
    selectedBranch,
    branches,
    dateValueHandler,
    branchChanged,
    showPicker,
  } = useBookingContext();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-4 px-6 rounded-t-xl shadow-md">
      <button 
        className="flex items-center justify-center space-x-2 mb-3 sm:mb-0 px-4 py-2 hover:bg-black/20 rounded-lg transition-colors"
        onClick={showPicker}
      >
        <span className="text-sm sm:text-base font-medium">
          {selectedDate
            ? format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale: id })
            : "Pilih Tanggal"}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          className="text-gray-300"
        >
          <path
            fill="currentColor"
            d="M12 14.975q-.2 0-.375-.062T11.3 14.7l-4.6-4.6q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l3.9 3.9l3.9-3.9q.275-.275.7-.275t.7.275t.275.7t-.275.7l-4.6 4.6q-.15.15-.325.213t-.375.062"
          />
        </svg>
      </button>
      <input
        id="hiddenDateInput"
        type="date"
        value={selectedDate}
        onChange={dateValueHandler}
        onKeyDown={(e) => e.preventDefault()}
        className="absolute opacity-0 w-0 h-0"
      />
      {!hideSelectBranch && (
        <div className="relative">
          <select
            name="branch"
            id="branch"
            onChange={branchChanged}
            value={selectedBranch}
            className="appearance-none bg-white/10 hover:bg-white/20 text-white border border-gray-600 rounded-lg pl-4 pr-10 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors text-sm sm:text-base"
          >
            {branches.map((branch: Branch) => (
              <option key={branch.id} value={branch.id} className="bg-gray-800 text-white">
                {branch.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
} 