"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [date, setDate] = useState<Date>(selectedDate);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const HOVER_RADIUS = 80; // pixels

  const isWithinHoverRadius = (clientX: number, clientY: number): boolean => {
    if (!triggerRef.current) return false;

    // Check if mouse is within trigger radius
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const centerX = triggerRect.left + triggerRect.width / 2;
    const centerY = triggerRect.top + triggerRect.height / 2;

    const distance = Math.sqrt(
      Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
    );

    const withinTriggerRadius =
      distance <=
      Math.max(triggerRect.width, triggerRect.height) / 2 + HOVER_RADIUS;

    // Check if mouse is within popover content
    if (popoverRef.current) {
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const withinPopover =
        clientX >= popoverRect.left &&
        clientX <= popoverRect.right &&
        clientY >= popoverRect.top &&
        clientY <= popoverRect.bottom;

      return withinTriggerRadius || withinPopover;
    }

    return withinTriggerRadius;
  };

  const handleClick = () => {
    router.push("/calendar");
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const withinRadius = isWithinHoverRadius(e.clientX, e.clientY);
      if (!withinRadius && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isOpen, handleMouseMove]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          ref={triggerRef}
          className={`cursor-pointer hover-highlight px-2 py-1 rounded ${
            className || ""
          }`}
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleClick();
            }
          }}
        >
          {formatISTDate(date)}
        </span>
      </PopoverTrigger>
      <PopoverContent
        ref={popoverRef}
        className="w-auto p-0 bg-[#eee5da] border border-[#262424]"
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
          className="bg-[#eee5da] w-auto"
        />
      </PopoverContent>
    </Popover>
  );
}
