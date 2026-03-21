// Date utility functions for calendar calculations
// These helpers format dates and calculate date ranges for each view

// Day names used in calendar headers (English, starting from Monday)
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Short month names
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Format a Date object to "YYYY-MM-DD" string
// This format is used as the key for storing/looking up meals
export function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Parse a "YYYY-MM-DD" string back into a Date object
export function parseDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

// Format a date for display like "Fri, Mar 21, 2026"
export function formatDisplayDate(date) {
  const dayName = DAY_NAMES[getMondayBasedDay(date)];
  const month = MONTH_NAMES[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${dayName}, ${month} ${day}, ${year}`;
}

// Format a short date like "Mar 21"
export function formatShortDate(date) {
  const month = MONTH_NAMES[date.getMonth()];
  return `${month} ${date.getDate()}`;
}

// Get day of week (0=Monday, 6=Sunday) instead of JS default (0=Sunday)
function getMondayBasedDay(date) {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
}

// Get the Monday of the week containing the given date
export function getWeekStart(date) {
  const d = new Date(date);
  const dayOfWeek = getMondayBasedDay(d);
  d.setDate(d.getDate() - dayOfWeek);
  return d;
}

// Get the Sunday of the week containing the given date
export function getWeekEnd(date) {
  const start = getWeekStart(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

// Get start and end date of a week as "YYYY-MM-DD" strings
export function getWeekRange(date) {
  return {
    start: formatDate(getWeekStart(date)),
    end: formatDate(getWeekEnd(date))
  };
}

// Get start and end date of a month as "YYYY-MM-DD" strings
export function getMonthRange(year, month) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0); // Last day of month
  return {
    start: formatDate(start),
    end: formatDate(end)
  };
}

// Get start and end date of a year as "YYYY-MM-DD" strings
export function getYearRange(year) {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`
  };
}

// Add days to a date and return a new Date
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Get an array of 7 dates for the week starting from the given date
export function getWeekDays(startDate) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
}

// Get calendar grid cells for a month view
// Returns an array of 35 or 42 dates (fills in days from prev/next month)
export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from the Monday before (or on) the first day of the month
  const startOffset = getMondayBasedDay(firstDay);
  const startDate = addDays(firstDay, -startOffset);

  // Calculate total cells needed (always fill complete weeks)
  const totalDays = startOffset + lastDay.getDate();
  const totalCells = totalDays <= 35 ? 35 : 42;

  const days = [];
  for (let i = 0; i < totalCells; i++) {
    const date = addDays(startDate, i);
    days.push({
      date,
      dateStr: formatDate(date),
      isCurrentMonth: date.getMonth() === month,
      isToday: formatDate(date) === formatDate(new Date())
    });
  }
  return days;
}

// Check if two dates are the same day
export function isSameDay(date1, date2) {
  return formatDate(date1) === formatDate(date2);
}

// Get today's date as "YYYY-MM-DD"
export function today() {
  return formatDate(new Date());
}

// Export constants for use in components
export { DAY_NAMES, MONTH_NAMES };
