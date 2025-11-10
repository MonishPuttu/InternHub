// ============= DISPLAY FUNCTIONS (UTC-based) =============

export const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${month}/${day}/${year}, ${hours}:${minutes} ${ampm}`;
};

export const formatDateUTC = formatDate; // Alias

export const formatDateOnly = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${month}/${day}/${year}`;
};

export const formatTimeOnly = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  let hours = date.getUTCHours();
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${ampm}`;
};

// ============= INPUT FUNCTIONS =============

/**
 * Convert date input to UTC midnight
 * Use for date-only fields (calendar events, deadlines)
 * Input: "2025-11-15"
 * Output: "2025-11-15T00:00:00.000Z"
 */
export const dateInputToUTC = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString + "T00:00:00.000Z").toISOString();
};

/**
 * Convert datetime-local input to UTC (assuming IST input)
 * User enters: "2025-11-15T14:00" (2 PM IST)
 * Stores as: "2025-11-15T08:30:00.000Z" (8:30 AM UTC)
 */
export const dateTimeInputToUTC = (dateTimeString) => {
  if (!dateTimeString) return null;

  // Parse the input as IST (UTC+5:30)
  const [datePart, timePart] = dateTimeString.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);

  // Create date in IST
  const istDate = new Date(year, month - 1, day, hours, minutes, 0);

  // Convert to UTC by subtracting 5 hours 30 minutes
  const utcDate = new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000);

  return utcDate.toISOString();
};

/**
 * Convert UTC date to datetime-local format (in IST)
 * For pre-filling edit forms
 */
export const utcToDateTimeInput = (utcDateString) => {
  if (!utcDateString) return "";

  const date = new Date(utcDateString);

  // Add 5 hours 30 minutes for IST
  const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);

  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istDate.getUTCDate()).padStart(2, "0");
  const hours = String(istDate.getUTCHours()).padStart(2, "0");
  const minutes = String(istDate.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Get current date for date input (YYYY-MM-DD format)
 */
export const getCurrentISTForInput = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Get current IST date/time for datetime-local input min value
 */
export const getCurrentISTDateTimeForInput = () => {
  const now = new Date();
  // Add 5.5 hours for IST
  const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);

  const year = istNow.getUTCFullYear();
  const month = String(istNow.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istNow.getUTCDate()).padStart(2, "0");
  const hours = String(istNow.getUTCHours()).padStart(2, "0");
  const minutes = String(istNow.getUTCMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// ============= OTHER UTILITIES =============

export const formatDateLong = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);

  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayName = days[date.getUTCDay()];
  const monthName = months[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();

  return `${dayName}, ${monthName} ${day}, ${year}`;
};

export const isToday = (dateStr) => {
  const date = new Date(dateStr);
  const today = new Date();

  return (
    date.getUTCFullYear() === today.getUTCFullYear() &&
    date.getUTCMonth() === today.getUTCMonth() &&
    date.getUTCDate() === today.getUTCDate()
  );
};

export const isTomorrow = (dateStr) => {
  const date = new Date(dateStr);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    date.getUTCFullYear() === tomorrow.getUTCFullYear() &&
    date.getUTCMonth() === tomorrow.getUTCMonth() &&
    date.getUTCDate() === tomorrow.getUTCDate()
  );
};
