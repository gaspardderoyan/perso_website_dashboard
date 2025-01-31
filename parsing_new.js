// parsing_new.js
import format from "date-fns";
import dotenv from "dotenv";

// Load the .env file
dotenv.config();

const defaultVaultPath = process.env.VAULT_PATH;

/**
 * Given a date string, and optionnaly a vaultPath (defaults from .env),
 * returns the full path of the Daily Note for the given date.
 */
export function dateToPath(date, vaultPath) {
  const basePath = vaultPath || defaultVaultPath; 
  return `${basePath}/${date}.md`;
}

/**
 * Generates an array of date strings within a given range from today.
 *
 * @param {number} startOffset - Starting offset in days from today (negative for past dates)
 * @param {number} endOffset - Ending offset in days from today
 * @returns {string[]} Array of dates in 'yyyy-MM-dd' format
 */
export function getDateRange(startOffset, endOffset) {
  const dates = [];
  for (let offset = startOffset; offset <= endOffset; offset++) {
    const dateStr = format(
      new Date().setDate(new Date().getDate() + offset),
      "yyyy-MM-dd"
    );
    dates.push(dateStr);
  }
  return dates;
}

