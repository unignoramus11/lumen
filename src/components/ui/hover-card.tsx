"use client";

/**
 * @file This file defines the HoverCard component and its sub-components (Trigger, Content).
 * It's built using Radix UI's HoverCard primitive, providing an accessible and customizable
 * hover card functionality.
 */

import * as React from "react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";

import { cn } from "@/lib/utils";

/**
 * The main HoverCard component.
 * It acts as a context provider for its trigger and content, managing their open/closed state.
 * @param {React.ComponentProps<typeof HoverCardPrimitive.Root>} props - Props for the Radix UI HoverCard.Root component.
 * @returns {JSX.Element} The HoverCard root component.
 */
function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />;
}

/**
 * The HoverCardTrigger component.
 * This element, when hovered over, will open the associated HoverCardContent.
 * It should be a direct child of the `HoverCard` component.
 * @param {React.ComponentProps<typeof HoverCardPrimitive.Trigger>} props - Props for the Radix UI HoverCard.Trigger component.
 * @returns {JSX.Element} The HoverCard trigger component.
 */
function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  );
}

/**
 * The HoverCardContent component.
 * This is the content that will be displayed when the `HoverCardTrigger` is hovered.
 * It should be a direct child of the `HoverCard` component.
 * @param {React.ComponentProps<typeof HoverCardPrimitive.Content>} props - Props for the Radix UI HoverCard.Content component.
 * @param {string} [props.className] - Additional CSS classes to apply to the content wrapper.
 * @param {"start" | "center" | "end"} [props.align="center"] - The alignment of the content relative to the trigger.
 * @param {number} [props.sideOffset=4] - The distance in pixels between the trigger and the content.
 * @returns {JSX.Element} The HoverCard content component.
 */
function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
