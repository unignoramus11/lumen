"use client";

/**
 * @file This file defines the Popover component and its sub-components (Trigger, Content, Anchor).
 * It's built using Radix UI's Popover primitive, providing an accessible and customizable
 * popover functionality.
 */

import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

/**
 * The main Popover component.
 * It acts as a context provider for its trigger and content, managing their open/closed state.
 * @param {React.ComponentProps<typeof PopoverPrimitive.Root>} props - Props for the Radix UI Popover.Root component.
 * @returns {JSX.Element} The Popover root component.
 */
function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

/**
 * The PopoverTrigger component.
 * This element, when interacted with (e.g., clicked), will toggle the associated PopoverContent.
 * It should be a direct child of the `Popover` component.
 * @param {React.ComponentProps<typeof PopoverPrimitive.Trigger>} props - Props for the Radix UI Popover.Trigger component.
 * @returns {JSX.Element} The Popover trigger component.
 */
function PopoverTrigger({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/**
 * The PopoverContent component.
 * This is the content that will be displayed when the `PopoverTrigger` is activated.
 * It should be a direct child of the `Popover` component.
 * @param {React.ComponentProps<typeof PopoverPrimitive.Content>} props - Props for the Radix UI Popover.Content component.
 * @param {string} [props.className] - Additional CSS classes to apply to the content wrapper.
 * @param {"start" | "center" | "end"} [props.align="center"] - The alignment of the content relative to the trigger.
 * @param {number} [props.sideOffset=4] - The distance in pixels between the trigger and the content.
 * @returns {JSX.Element} The Popover content component.
 */
function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}

/**
 * The PopoverAnchor component.
 * This component is used to explicitly define the anchor element for the popover content.
 * If not used, the `PopoverTrigger` will implicitly be the anchor.
 * @param {React.ComponentProps<typeof PopoverPrimitive.Anchor>} props - Props for the Radix UI Popover.Anchor component.
 * @returns {JSX.Element} The Popover anchor component.
 */
function PopoverAnchor({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
