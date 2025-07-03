/**
 * @file This file contains utility functions for the application.
 * It primarily provides a helper for conditionally joining Tailwind CSS classes.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function that conditionally joins CSS class names together.
 * It combines the functionality of `clsx` for conditional class application
 * and `tailwind-merge` for intelligently merging Tailwind CSS classes to resolve conflicts.
 * This is particularly useful for building dynamic and responsive UI components.
 * @param {ClassValue[]} inputs - An array of class values, which can be strings, objects, or arrays.
 * @returns {string} A single string containing merged and optimized CSS class names.
 * @example
 * // Basic usage
 * cn("text-red-500", "bg-blue-200"); // => "text-red-500 bg-blue-200"
 *
 * // Conditional classes
 * cn("p-4", { "bg-green-500": true, "text-white": false }); // => "p-4 bg-green-500"
 *
 * // Merging conflicting Tailwind classes
 * cn("p-4", "p-6"); // => "p-6"
 * cn("bg-red-500", "bg-blue-500"); // => "bg-blue-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
