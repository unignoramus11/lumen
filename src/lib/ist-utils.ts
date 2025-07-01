// Utility functions for handling IST (Indian Standard Time) consistently across the app

export function getISTDate(date?: Date): Date {
  const targetDate = date || new Date();
  return new Date(
    targetDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
}

export function getISTDateString(date?: Date): string {
  const istDate = getISTDate(date);
  return istDate.toISOString().split("T")[0];
}

export function formatISTDate(
  date: Date,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  };

  return date.toLocaleDateString("en-US", { ...defaultOptions, ...options });
}

export function getCurrentISTDate(): Date {
  return getISTDate();
}

export function getCurrentISTDateString(): string {
  return getISTDateString();
}
