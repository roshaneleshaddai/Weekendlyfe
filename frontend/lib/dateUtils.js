// Utility functions for consistent date formatting to avoid hydration errors

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  // Use a consistent locale and ensure it works the same on server and client
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

export const formatDateShort = (date) => {
  // Use consistent date formatting to avoid hydration mismatches
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
};

export const getWeekendDates = (dateStr) => {
  const date = new Date(dateStr);
  const saturday = new Date(date);
  saturday.setDate(date.getDate() + (6 - date.getDay()));
  const sunday = new Date(saturday);
  sunday.setDate(saturday.getDate() + 1);
  return { saturday, sunday };
};
