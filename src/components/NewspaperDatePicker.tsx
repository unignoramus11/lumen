"use client";

/**
 * @file This file defines the NewspaperDatePicker component, a custom date picker
 * designed for the Lumen Sigma application. It combines a date display with a popover calendar
 * for date selection and includes hover-based interaction for desktop and click-based
 * navigation to a full calendar view.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatISTDate, getCurrentISTDate } from "@/lib/ist-utils";

/**
 * Props for the NewspaperDatePicker component.
 * @property {string} [className] - Optional CSS class names to apply to the trigger element.
 * @property {Date} [selectedDate=new Date()] - The currently selected date. Defaults to the current date.
 * @property {(date: Date) => void} [onDateChange] - Callback function triggered when a new date is selected.
 */
interface NewspaperDatePickerProps {
  className?: string;
  selectedDate?: Date;
  onDateChange?: (date: Date) => void;
}

/**
 * NewspaperDatePicker component provides a date display that, when clicked, navigates
 * to a full calendar view, and on hover (desktop), reveals a popover calendar for quick date selection.
 * @param {NewspaperDatePickerProps} { className, selectedDate, onDateChange } - The props for the component.
 * @returns {JSX.Element} The JSX for the NewspaperDatePicker component.
 */
export default function NewspaperDatePicker({
  className,
  selectedDate = new Date(),
  onDateChange,
}: NewspaperDatePickerProps) {
  const router = useRouter();
  /**
   * State for the date currently displayed and selected in the calendar.
   * @type {Date}
   */
  const [date, setDate] = useState<Date>(selectedDate);
  /**
   * State to control the open/closed state of the popover calendar.
   * @type {boolean}
   */
  const [isOpen, setIsOpen] = useState(false);
  /**
   * Ref for the trigger element (the displayed date text) to measure its position.
   * @type {React.RefObject<HTMLSpanElement>}
   */
  const triggerRef = useRef<HTMLSpanElement>(null);
  /**
   * Ref for the popover content element (the calendar) to measure its position.
   * @type {React.RefObject<HTMLDivElement>}
   */
  const popoverRef = useRef<HTMLDivElement>(null);

  /**
   * Defines the radius (in pixels) around the trigger element within which the mouse
   * must remain to keep the popover open on hover.
   * @type {number}
   */
  const HOVER_RADIUS = 80; // pixels

  /**
   * Checks if the mouse cursor is within the hover radius of the trigger element
   * or inside the popover content itself.
   * @param {number} clientX - The X coordinate of the mouse cursor.
   * @param {number} clientY - The Y coordinate of the mouse cursor.
   * @returns {boolean} True if the mouse is within the hover area, false otherwise.
   */
  const isWithinHoverRadius = (clientX: number, clientY: number): boolean => {
    if (!triggerRef.current) return false;

    // Get the bounding rectangle of the trigger element.
    const triggerRect = triggerRef.current.getBoundingClientRect();
    // Calculate the center coordinates of the trigger.
    const centerX = triggerRect.left + triggerRect.width / 2;
    const centerY = triggerRect.top + triggerRect.height / 2;

    // Calculate the distance from the mouse to the center of the trigger.
    const distance = Math.sqrt(
      Math.pow(clientX - centerX, 2) + Math.pow(clientY - centerY, 2)
    );

    // Check if the mouse is within the defined hover radius around the trigger.
    const withinTriggerRadius =
      distance <=
      Math.max(triggerRect.width, triggerRect.height) / 2 + HOVER_RADIUS;

    // If the popover content is rendered, check if the mouse is also within its bounds.
    if (popoverRef.current) {
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const withinPopover =
        clientX >= popoverRect.left &&
        clientX <= popoverRect.right &&
        clientY >= popoverRect.top &&
        clientY <= popoverRect.bottom;

      // Return true if within trigger radius OR within popover content.
      return withinTriggerRadius || withinPopover;
    }

    // If popover content is not rendered, only consider the trigger radius.
    return withinTriggerRadius;
  };

  /**
   * Handles the click event on the date display.
   * Navigates the user to the full calendar page.
   */
  const handleClick = () => {
    router.push("/calendar");
  };

  /**
   * Handles the mouse enter event on the date display.
   * Opens the popover calendar.
   */
  const handleMouseEnter = () => {
    setIsOpen(true);
  };

  /**
   * Memoized callback function to handle mouse movement across the document.
   * Closes the popover if the mouse moves outside the combined hover area
   * of the trigger and the popover content.
   * @param {MouseEvent} e - The mouse event object.
   */
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const withinRadius = isWithinHoverRadius(e.clientX, e.clientY);
      if (!withinRadius && isOpen) {
        setIsOpen(false);
      }
    },
    [isOpen] // Dependency: re-run if isOpen changes
  );

  /**
   * useEffect hook to sync the internal date state with the selectedDate prop.
   */
  useEffect(() => {
    setDate(selectedDate);
  }, [selectedDate]);

  /**
   * useEffect hook to add and remove the mousemove event listener.
   * The listener is active only when the popover is open to efficiently track mouse position.
   */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousemove", handleMouseMove);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
      };
    }
  }, [isOpen, handleMouseMove]); // Dependencies: re-run if isOpen or handleMouseMove change

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* PopoverTrigger: The element that triggers the popover (the displayed date). */}
      <PopoverTrigger asChild>
        <span
          ref={triggerRef} // Attach ref to the trigger element
          className={`cursor-pointer hover-highlight px-2 py-1 rounded ${
            className || ""
          }`} // Apply dynamic class names
          role="button" // Indicate that this element is a button for accessibility
          tabIndex={0} // Make the element focusable
          onClick={handleClick} // Handle click to navigate to calendar page
          onMouseEnter={handleMouseEnter} // Handle mouse enter to open popover
          onKeyDown={(e) => {
            // Handle keyboard navigation (Enter or Space key) to trigger click
            if (e.key === "Enter" || e.key === " ") {
              handleClick();
            }
          }}
        >
          {formatISTDate(date)} {/* Display the formatted selected date */}
        </span>
      </PopoverTrigger>
      {/* PopoverContent: The content displayed when the popover is open (the calendar). */}
      <PopoverContent
        ref={popoverRef} // Attach ref to the popover content element
        className="w-auto p-0 bg-[#eee5da] border border-[#262424]" // Apply custom styling
        align="end" // Align the popover to the end of the trigger
        sideOffset={4} // Offset the popover from the trigger
      >
        {/* Calendar component for date selection. */}
        <Calendar
          mode="single" // Allow only single date selection
          selected={date} // Set the currently selected date
          onSelect={(newDate) => {
            // Handle date selection
            if (newDate) {
              setDate(newDate); // Update internal date state
              onDateChange?.(newDate); // Call external onDateChange callback if provided
              setIsOpen(false); // Close the popover after selection
            }
          }}
          disabled={(date) => {
            // Disable dates in the future relative to the current IST date
            const nowIST = getCurrentISTDate();
            return date > nowIST;
          }}
          className="bg-[#eee5da] w-auto" // Apply custom styling to the calendar
        />
      </PopoverContent>
    </Popover>
  );
}
