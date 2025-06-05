"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useBookingContext } from "@/context/booking/booking.context";
import { Branch } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Check, CalendarIcon, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  } = useBookingContext();

  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>(branches);

  useEffect(() => {
    if (searchQuery) {
      setFilteredBranches(
        branches.filter((branch) =>
          branch.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredBranches(branches);
    }
  }, [searchQuery, branches]);

  const handleBranchSelect = (branchId: string) => {
    const event = {
      target: {
        value: branchId,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    branchChanged(event);
    setOpen(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const event = {
        target: {
          value: format(date, "yyyy-MM-dd"),
        },
      } as React.ChangeEvent<HTMLInputElement>;
      dateValueHandler(event);
      setCalendarOpen(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white py-6 px-8 rounded-t-xl shadow-lg">
      <div className="mb-4 sm:mb-0">
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full sm:w-auto justify-start text-left font-medium bg-white/10 hover:bg-white/20 border-gray-600 text-white hover:text-white"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate
                ? format(new Date(selectedDate), "EEEE, dd MMMM yyyy", { locale: id })
                : "Pilih Tanggal"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate ? new Date(selectedDate) : undefined}
              onSelect={handleDateSelect}
              initialFocus
              locale={id}
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      </div>

      {!hideSelectBranch && (
        <div className="w-full sm:w-auto">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full sm:w-[250px] justify-between bg-white/10 hover:bg-white/20 border-gray-600 text-white hover:text-white"
              >
                {selectedBranch
                  ? branches.find((branch) => branch.id === selectedBranch)?.name || "Pilih Cabang"
                  : "Pilih Cabang"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full sm:w-[250px] p-0">
              <div className="flex items-center border-b px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="Cari cabang..."
                  className="flex h-9 w-full rounded-md bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Command>
                <CommandEmpty>Tidak ada cabang yang ditemukan</CommandEmpty>
                <CommandGroup className="max-h-[300px] overflow-auto">
                  {filteredBranches.map((branch) => (
                    <CommandItem
                      key={branch.id}
                      value={branch.name}
                      onSelect={() => handleBranchSelect(String(branch.id))}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          Number(selectedBranch) === branch.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {branch.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
} 