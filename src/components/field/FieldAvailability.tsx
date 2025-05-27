"use client";

import { useBooking } from "@/hooks/bookings/useBooking.hook";
import { useTimeSlot } from "@/hooks/useTimeSlot.hook";
import { id } from "date-fns/locale";
import { format } from "date-fns";
import { Field } from "@/types";

interface FieldAvailabilityProps {
  field: Field;
}

export default function FieldAvailability({ field }: FieldAvailabilityProps) {
  const filteredFields = field;
  const {
    getTimeSlotStatus,
    getTimeSlotClass,
    getStatusIcon,
  } = useTimeSlot();

  const {
      selectedDate,
      dateValueHandler,
      showPicker,
    } = useBooking();

  const renderIcon = (iconHTML: string) => {
    return (
      <div dangerouslySetInnerHTML={{ __html: iconHTML }} />
    );
  };

  console.log("field: ", field);

  return (
    <div className="grid grid-cols-1">
      {filteredFields ? (
          <div key={filteredFields.id} className="border border-gray-200 rounded overflow-hidden bg-white">
            <div className="text-center py-2 font-semibold border-b border-gray-200">
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
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {[...Array(16)].map((_, index) => {
                const time = `${(index + 8).toString().padStart(2, '0')}:00`;
                const status = getTimeSlotStatus(filteredFields, time);
                const iconHTML = getStatusIcon(filteredFields, time);
                
                return (
                  <div 
                    key={index} 
                    className={`flex justify-between items-center border-b border-gray-100 last:border-b-0`}
                  >
                    <div className="py-2 px-3 w-[30%] text-left border-r border-gray-100">
                      {time}
                    </div>
                    <div className={`py-2 px-3 flex-1 flex justify-between items-center ${getTimeSlotClass(filteredFields, time)}`}>
                      <span className="font-medium text-sm">
                        {status}
                      </span>
                      {iconHTML && renderIcon(iconHTML)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        
      ) : (
        <div className="col-span-full py-8 text-center bg-red-50 rounded border border-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-500 font-semibold">Jadwal Belum Tersedia</p>
        </div>
      )}
    </div>
  );
} 