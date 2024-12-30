import { existsSync, readFileSync, writeFileSync } from "fs";
import { format } from "date-fns";
import yaml from "js-yaml";
const vaultPath = "/Users/gaspardderoyan/SyncThing/Gas24/Daily Notes";

/**
 * Generates an array of date strings within a given range from today.
 *
 * @param {number} startOffset - Starting offset in days from today (negative for past dates)
 * @param {number} endOffset - Ending offset in days from today
 * @returns {string[]} Array of dates in 'yyyy-MM-dd' format
 */
function getDateRange(startOffset, endOffset) {
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
 * Parses a markdown file to extract YAML front matter.
 *
 * @param {string} filePath - The path to the markdown file.
 * @returns {string|undefined} The extracted YAML front matter without leading or trailing newlines, or undefined if an error occurs.
 * @throws {Error} If the file does not exist or YAML front matter is not found.
 */
function parseMarkdown(filePath) {
  try {
    // Check if file exists
    if (!existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Read file's content
    const content = readFileSync(filePath, "utf-8");

    // Split the content to extract YAML front matter
    const yamlFront = content.split("---", 2);

    // Check if YAML front matter is present
    if (yamlFront.length < 2) {
      throw new Error("YAML front matter not found");
    }

    // Return the YAML without \n on top/bottom
    return yamlFront[1].trim();
  } catch (error) {
    // console.error(`Error parsing markdown file: ${error.message}`)
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
function parseYAML(yamlString) {
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
function getYAMLDataAsObjectFromDates(datesArray) {
  const dataObj = {};

  datesArray.forEach((dateStr) => {
    const filePath = `${vaultPath}/${dateStr}.md`;
    const yamlStr = parseMarkdown(filePath);
    if (yamlStr) {
      const yamlObj = parseYAML(yamlStr);
      dataObj[dateStr] = yamlObj;
      dataObj[dateStr].modified = false;
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
function updateYAMLFrontmatter(filePath, newData) {
  try {
    // Read the file content
    const content = readFileSync(filePath, "utf-8");

    // Split the content to extract the body
    const parts = content.split("---");
    if (parts.length < 3) {
      throw new Error("Invalid markdown file format");
    }

    // Create new YAML front matter
    const newFrontmatter = yaml.dump(newData);

    // Reconstruct the file content with new front matter
    const newContent = `---\n${newFrontmatter}---\n${parts
      .slice(2)
      .join("---")}`;

    // Write the updated content back to the file
    writeFileSync(filePath, newContent, "utf-8");
  } catch (error) {
    console.error(`Error updating file ${filePath}: ${error.message}`);
  }
}

function updateAllYAMLFiles(data) {
  Object.keys(data).forEach((date) => {
    const filePath = `${vaultPath}/${date}.md`;
    updateYAMLFrontmatter(filePath, data[date]);
  });
}

// Export the functions for testing
export { getDateRange, getYAMLDataAsObjectFromDates, updateAllYAMLFiles };
