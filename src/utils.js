import { format, parseISO } from "https://esm.sh/date-fns";

const DEBUG = true;

export function printDebug(message) {
  if (DEBUG) {
    console.log(message);
  }
}

export function formatDate(dateString) {
  try {
    const date = parseISO(dateString);
    return format(date, "MMM do EEE");
  } catch (err) {
    return dateString;
  }
}
