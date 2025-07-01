"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface NewspaperDatePickerProps {
  className?: string;
}

export default function NewspaperDatePicker({
  className,
}: NewspaperDatePickerProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
              setIsOpen(false);
            }
          }}
          className="bg-white w-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
