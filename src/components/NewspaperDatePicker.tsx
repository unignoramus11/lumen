"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatISTDate, getCurrentISTDate } from "@/lib/ist-utils";

interface NewspaperDatePickerProps {
  className?: string;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

export default function NewspaperDatePicker({
  className,
  selectedDate = new Date(),
  onDateChange,
}: NewspaperDatePickerProps) {
  const [date, setDate] = useState<Date>(selectedDate);
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return formatISTDate(date);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          className={`cursor-pointer hover-highlight px-2 py-1 rounded ${
            className || ""
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsOpen(!isOpen);
            }
          }}
        >
          {formatDate(date)}
        </span>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 bg-white border border-black"
        align="end"
        sideOffset={4}
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            if (newDate) {
              setDate(newDate);
              onDateChange?.(newDate);
              setIsOpen(false);
            }
          }}
          disabled={(date) => {
            // Get current date in IST
            const nowIST = getCurrentISTDate();
            return date > nowIST;
          }}
          className="bg-white w-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
