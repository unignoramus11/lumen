"use client";

/**
 * @file This file defines a customizable Select component and its sub-components,
 * built on top of Radix UI's Select primitive. It provides an accessible and flexible
 * dropdown selection interface with various styling and functionality options.
 */

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * The main Select component.
 * It acts as a context provider for its trigger, content, and items, managing their state.
 * @param {React.ComponentProps<typeof SelectPrimitive.Root>} props - Props for the Radix UI Select.Root component.
 * @returns {JSX.Element} The Select root component.
 */
function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

/**
 * A grouping component for Select items.
 * Used to logically group related items within the Select content.
 * @param {React.ComponentProps<typeof SelectPrimitive.Group>} props - Props for the Radix UI Select.Group component.
 * @returns {JSX.Element} The Select group component.
 */
function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

/**
 * Displays the currently selected value of the Select component.
 * @param {React.ComponentProps<typeof SelectPrimitive.Value>} props - Props for the Radix UI Select.Value component.
 * @returns {JSX.Element} The Select value display component.
 */
function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

/**
 * The trigger component for the Select dropdown.
 * When clicked, it opens or closes the Select content.
 * @param {React.ComponentProps<typeof SelectPrimitive.Trigger> & { size?: "sm" | "default" }} props - Props for the Radix UI Select.Trigger component.
 * @param {string} [props.className] - Additional CSS classes to apply to the trigger.
 * @param {"sm" | "default"} [props.size="default"] - The size variant of the trigger.
 * @param {React.ReactNode} props.children - The content to be rendered inside the trigger (e.g., the SelectValue).
 * @returns {JSX.Element} The Select trigger component.
 */
function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-4 opacity-50" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/**
 * The content container for the Select dropdown.
 * It holds the Select items and handles positioning and animations.
 * @param {React.ComponentProps<typeof SelectPrimitive.Content>} props - Props for the Radix UI Select.Content component.
 * @param {string} [props.className] - Additional CSS classes to apply to the content wrapper.
 * @param {React.ReactNode} props.children - The content to be rendered inside the dropdown (e.g., SelectGroup, SelectItem).
 * @param {"popper" | "item-aligned"} [props.position="popper"] - The positioning strategy for the content.
 * @returns {JSX.Element} The Select content component.
 */
function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
          className
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-1",
            position === "popper" &&
              "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

/**
 * A label component for Select items.
 * Used to provide a descriptive heading for a group of items.
 * @param {React.ComponentProps<typeof SelectPrimitive.Label>} props - Props for the Radix UI Select.Label component.
 * @param {string} [props.className] - Additional CSS classes to apply to the label.
 * @returns {JSX.Element} The Select label component.
 */
function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  );
}

/**
 * An individual item within the Select dropdown.
 * Represents a selectable option in the list.
 * @param {React.ComponentProps<typeof SelectPrimitive.Item>} props - Props for the Radix UI Select.Item component.
 * @param {string} [props.className] - Additional CSS classes to apply to the item.
 * @param {React.ReactNode} props.children - The content to be rendered inside the item.
 * @returns {JSX.Element} The Select item component.
 */
function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

/**
 * A separator component for Select items.
 * Used to visually divide groups of items within the Select content.
 * @param {React.ComponentProps<typeof SelectPrimitive.Separator>} props - Props for the Radix UI Select.Separator component.
 * @param {string} [props.className] - Additional CSS classes to apply to the separator.
 * @returns {JSX.Element} The Select separator component.
 */
function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

/**
 * A button component for scrolling up within the Select content.
 * Appears when there are more items above the current view.
 * @param {React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>} props - Props for the Radix UI Select.ScrollUpButton component.
 * @param {string} [props.className] - Additional CSS classes to apply to the button.
 * @returns {JSX.Element} The Select scroll up button component.
 */
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronUpIcon className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

/**
 * A button component for scrolling down within the Select content.
 * Appears when there are more items below the current view.
 * @param {React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>} props - Props for the Radix UI Select.ScrollDownButton component.
 * @param {string} [props.className] - Additional CSS classes to apply to the button.
 * @returns {JSX.Element} The Select scroll down button component.
 */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <ChevronDownIcon className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
