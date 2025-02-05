// parsing_new.js
import { format } from "date-fns";
import dotenv from "dotenv";
import { existsSync, readFileSync, writeFileSync } from "fs";
import yaml from "js-yaml";
import os from "os";

// Load the .env file
dotenv.config();

let defaultVaultPath;

if (os.platform() === 'darwin') {
  defaultVaultPath = process.env.MAC_VAULT_PATH;
} else {
  defaultVaultPath = process.env.RPI_VAULT_PATH;
}

console.log("defaultVaultPath: ", defaultVaultPath);

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

/**
 * Parses a markdown file to extract YAML front matter or the content after it.
 *
 * @param {string} filePath - The path to the markdown file.
 * @param {string} target - The target to extract: "yaml" for YAML front matter, "content" for everything after YAML.
 * @returns {string|undefined} The extracted YAML front matter or content, or undefined if an error occurs.
 * @throws {Error} If the file does not exist, YAML front matter is not found, or the target is invalid.
 */
export function parseMarkdown(filePath, target) {
  try {
    // Check if file exists
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read file's content
    const content = readFileSync(filePath, "utf-8");

    // Find positions of the first and second '---'
    const firstIndex = content.indexOf("---");
    const secondIndex = content.indexOf("---", firstIndex + 3);

    // Ensure there are two '---' separators
    if (firstIndex === -1 || secondIndex === -1) {
      throw new Error("YAML front matter not found");
    }

    // Extract YAML front matter and content
    const yaml = content.substring(firstIndex + 3, secondIndex).trim();
    const contentAfterYaml = content.substring(secondIndex + 3);

    // Return based on target
    if (target === "yaml") {
      return yaml;
    } else if (target === "content") {
      return contentAfterYaml.trim();
    } else {
      throw new Error(`Invalid target specified: ${target}`);
    }
  } catch (error) {
    console.error(`Error parsing markdown file: ${error.message}`);
  }
}

/**
 * Parses a YAML string into a JavaScript object.
 *
 * @param {string} yamlString - The YAML string to parse.
 * @returns {Object} The parsed data as a JavaScript object.
 *
 * @example
 * const yamlString = `
 * key1: value1
 * key2: value2
 * `;
 * const data = parseYAML(yamlString);
 * console.log(data); // { key1: 'value1', key2: 'value2' }
 */
export function parseYAML(yamlString) {
  if (yamlString === null || yamlString === undefined) {
    throw new Error("Input YAML string cannot be null or undefined");
  }

  const data = {};
  const lines = yamlString.split("\n");
  lines.forEach((line) => {
    const [key, value] = line.split(":").map((s) => s.trim());

    // Convert value to appropriate type
    if (value === "") {
      data[key] = undefined;
    } else if (value === "null") {
      data[key] = null;
    } else if (value === "true") {
      data[key] = true;
    } else if (value === "false") {
      data[key] = false;
    } else if (!isNaN(value)) {
      data[key] = Number(value);
    } else {
      data[key] = value;
    }
  });
  return data;
}

/**
 * Retrieves and parses YAML front matter from markdown files for given dates.
 *
 * @param {string[]} datesArray - Array of date strings in 'yyyy-MM-dd' format
 * @returns {Object.<string, Object>} Object with dates as keys and parsed YAML data as values
 * @throws {Error} If YAML parsing fails for any date
 *
 * @example
 * const datesArray = ['2023-10-01', '2023-10-02'];
 * const data = getYAMLDataAsObjectFromDates(datesArray);
 * console.log(data);
 * // Output:
 * // {
 * //   '2023-10-01': { key1: 'value1', key2: 'value2' },
 * //   '2023-10-02': { key1: 'value3', key2: 'value4' }
 * // }
 */
export function getYAMLDataAsObjectFromDates(datesArray) {
  const dataObj = {};

  datesArray.forEach((dateStr) => {
    const filePath = dateToPath(dateStr);
    const yamlStr = parseMarkdown(filePath, "yaml");
    if (yamlStr) {
      const yamlObj = parseYAML(yamlStr);
      dataObj[dateStr] = yamlObj;
    } else {
      dataObj[dateStr] = {}; // Ensure an empty object is returned if no YAML is found
    }
  });

  return dataObj;
}

/**
 * Updates the YAML front matter of a markdown file with new data.
 *
 * @param {string} filePath - The path to the markdown file.
 * @param {Object} newData - The new data to replace the YAML front matter.
 */
export function updateYAMLFrontmatter(filePath, newData) {
  try {
    const content = parseMarkdown(filePath, "content");

    // Reconstruct the file content with new front matter
    const newFrontmatter = yaml.dump(newData);
    const newContent = `---\n${newFrontmatter}---\n${content}`;

    //console.log(`newFrontmatter:\n${newFrontmatter}\n`);
    //console.log(`newContent:\n${newContent}`);
    // Write the updated content back to the file
    writeFileSync(filePath, newContent, "utf-8");
  } catch (error) {
    console.error(`Error updating file ${filePath}: ${error.message}`);
  }
}
/**
 * Updates the YAML front matter of all markdown files with new data.
 *
 * @param {Object} data - The data to update.
 */
export function updateAllYAMLFiles(data) {
  Object.keys(data).forEach((date) => {
    const filePath = dateToPath(date);
    updateYAMLFrontmatter(filePath, data[date]);
  });
}
