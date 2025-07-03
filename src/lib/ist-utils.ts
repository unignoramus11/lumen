/**
 * @file This file provides utility functions for consistently handling dates and times
 * in Indian Standard Time (IST) throughout the Lumen Sigma application.
 * This ensures that all date-related operations, especially those interacting with APIs
 * or the database, are synchronized to a single timezone.
 */

/**
 * Converts a given Date object to its equivalent in Indian Standard Time (IST).
 * If no date is provided, it defaults to the current date and time.
 * @param {Date} [date] - The optional Date object to convert. Defaults to `new Date()`.
 * @returns {Date} A new Date object representing the time in IST.
 */
export function getISTDate(date?: Date): Date {
  const targetDate = date || new Date();
  // Convert the date to IST string representation and then parse it back to a Date object
  // This effectively changes the timezone of the Date object.
  return new Date(
    targetDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
}

/**
 * Returns the date part of a given Date object formatted as a YYYY-MM-DD string in IST.
 * This is useful for consistent date representation, especially for database queries.
 * If no date is provided, it defaults to the current date in IST.
 * @param {Date} [date] - The optional Date object to format. Defaults to `new Date()`.
 * @returns {string} The date formatted as "YYYY-MM-DD" in IST.
 */
export function getISTDateString(date?: Date): string {
  const istDate = getISTDate(date);
  // Convert to ISO string and take only the date part (e.g., "2025-07-03")
  return istDate.toISOString().split("T")[0];
}

/**
 * Formats a given Date object into a human-readable string in IST.
 * Allows for custom formatting options to be passed.
 * @param {Date} date - The Date object to format.
 * @param {Intl.DateTimeFormatOptions} [options] - Optional `Intl.DateTimeFormatOptions` to customize the output format.
 * @returns {string} The formatted date string in IST.
 */
export function formatISTDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  // Default options for a long date format including weekday, year, month, and day in IST.
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  };

  // Merge default options with any provided custom options and format the date.
  return date.toLocaleDateString("en-US", { ...defaultOptions, ...options });
}

/**
 * Returns the current date and time as a Date object in Indian Standard Time (IST).
 * This is a convenience function that wraps `getISTDate()` without any arguments.
 * @returns {Date} The current Date object in IST.
 */
export function getCurrentISTDate(): Date {
  return getISTDate();
}

/**
 * Returns the current date formatted as a YYYY-MM-DD string in Indian Standard Time (IST).
 * This is a convenience function that wraps `getISTDateString()` without any arguments.
 * @returns {string} The current date formatted as "YYYY-MM-DD" in IST.
 */
export function getCurrentISTDateString(): string {
  return getISTDateString();
}
