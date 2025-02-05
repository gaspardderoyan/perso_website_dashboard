// script.js
import { printDebug, formatDate } from "./utils.js";

// --- Configuration ---
const apiUrl = "http://localhost:8080"; // Base URL for API requests
const dataTableId = "dataTable"; // ID of the table element in the HTML
const fetchButtonId = "fetchButton"; // ID of the fetch data button
const pushButtonId = "pushButton"; // ID of the push data button

// --- State Management ---
let fetchedData = {}; // Object to store fetched data; dates as keys, each date contains key-value pairs of metrics

// --- DOM Element References (moved to be globally accessible and initialized once) ---
const dataTable = document.getElementById(dataTableId); // Reference to the table element
const fetchButton = document.getElementById(fetchButtonId); // Reference to the fetch button
const pushButton = document.getElementById(pushButtonId); // Reference to the push button

/**
 * Function to fetch data from the API.
 *
 * @param {number} offset - The offset to use for fetching data, likely for date range. Negative values might indicate past days.
 */
async function fetchData(offset) {
  // Function is marked as 'async' to use 'await' for cleaner promise handling.
  const url = `${apiUrl}/get_habits?prev=${offset}&next=0&key=dopamine`; // Construct the API URL with the given offset.
  printDebug(`Fetching data from: ${url}`); // Debug log to show the URL being fetched

  try {
    // Using try...catch block for error handling during fetch and JSON parsing.
    const response = await fetch(url); // Use 'await' to wait for the fetch operation to complete.

    if (!response.ok) {
      // Check if the HTTP response status code indicates an error.
      // If the response is not in the 200-299 range, it's considered an error.
      throw new Error(`HTTP error! status: ${response.status}`); // Throw an error with the status code.
    }

    const data = await response.json(); // Parse the JSON response body. 'await' ensures parsing is complete before proceeding.
    fetchedData = data; // Store the fetched data in the global 'fetchedData' variable.
    printDebug("Data fetched successfully:");
    printDebug(JSON.stringify(fetchedData, null, 2)); // Print fetched data to debug console in a readable format.
    displayDataInTable(data); // Call function to display the fetched data in the HTML table.
  } catch (error) {
    // Catch any errors that occurred during the fetch or processing.
    console.error(`Fetch error: ${error.message}`); // Log the error message to the console.
    // TODO: Implement user-friendly error display in the UI, instead of just console logging.
  }
}

/**
 * Function to display the fetched data in an HTML table.
 *
 * @param {object} data - The data object to display. Expected structure: {date: {key: value, ...}, ...}
 */
function displayDataInTable(data) {
  if (!dataTable) {
    // Check if the table element exists in the DOM.
    console.error("Data table element not found in the DOM."); // Log an error if the table element is not found.
    return; // Exit the function if the table element is not found to prevent further errors.
  }

  clearTableRows(dataTable); // Clear any existing rows in the table before adding new data.

  const dates = Object.keys(data); // Extract the dates from the data object's keys. Dates will be used as column headers.
  if (dates.length === 0) {
    // Check if there are any dates in the fetched data.
    dataTable.innerHTML = "<tr><td>No data available</td></tr>"; // Display a message if no data is available.
    return; // Exit the function if there's no data to display.
  }

  const keys = extractKeysFromData(data); // Extract all unique keys (metrics) from the data to use as row headers.

  createTableHeader(dataTable, dates); // Create the table header row with dates.
  createTableBody(dataTable, dates, keys, data); // Create the table body rows with data for each key and date.
}

/**
 * Function to clear all rows from the given table element, except for the header.
 *
 * @param {HTMLTableElement} tableElement - The HTML table element to clear rows from.
 */
function clearTableRows(tableElement) {
  // Efficiently clear all rows by setting innerHTML to an empty string.
  // This removes all child elements (rows) from the table body.
  tableElement.innerHTML = "";
}

/**
 * Extracts all unique keys from the data object. These keys represent the metrics.
 *
 * @param {object} data - The data object.
 * @returns {string[]} An array of unique keys (metrics).
 */
function extractKeysFromData(data) {
  // Use Set to automatically handle uniqueness of keys.
  return [
    ...new Set(Object.values(data).flatMap((entry) => Object.keys(entry))),
  ];
  // 1. `Object.values(data)`: Gets an array of all data entries (objects) for each date.
  // 2. `.flatMap((entry) => Object.keys(entry))`: For each date's data entry, extract its keys and flatten into a single array.
  // 3. `new Set(...)`: Creates a Set from the array of keys, which automatically removes duplicates.
  // 4. `[... ]`: Converts the Set back into an array.
}

/**
 * Creates the table header row with date columns.
 *
 * @param {HTMLTableElement} tableElement - The table element to add the header to.
 * @param {string[]} dates - An array of date strings to be used as header columns.
 */
function createTableHeader(tableElement, dates) {
  const headerRow = document.createElement("tr"); // Create a new table row element for the header.

  // Add an empty header cell for the metric column (first column is for metric names).
  const metricHeader = document.createElement("th");
  metricHeader.textContent = "Metric";
  headerRow.appendChild(metricHeader);

  // Loop through each date in the dates array and create a header cell for it.
  dates.forEach((date) => {
    const dateHeader = document.createElement("th"); // Create a header cell for the date.
    dateHeader.textContent = formatDate(date); // Format the date for display using the formatDate function from utils.js.
    dateHeader.setAttribute("data-date-value", date); // Store the original date value as a data attribute for potential future use (e.g., sorting, filtering).
    headerRow.appendChild(dateHeader); // Append the date header cell to the header row.
  });

  tableElement.appendChild(headerRow); // Append the complete header row to the table element.
}

/**
 * Creates the table body rows with data for each key (metric) and date.
 *
 * @param {HTMLTableElement} tableElement - The table element to append rows to.
 * @param {string[]} dates - An array of dates (column headers).
 * @param {string[]} keys - An array of keys (metrics) to display as rows.
 * @param {object} data - The data object containing values for each date and key.
 */
function createTableBody(tableElement, dates, keys, data) {
  keys.forEach((key) => {
    // Iterate over each key (metric) to create a table row for it.
    const dataRow = document.createElement("tr"); // Create a new table row element for each metric.
    const keyHeaderCell = document.createElement("td"); // Create a table data cell for the metric name.
    keyHeaderCell.textContent = key.charAt(0).toUpperCase() + key.slice(1); // Capitalize the first letter of the key for display.
    dataRow.appendChild(keyHeaderCell); // Append the key (metric) name cell to the row.
    dataRow.setAttribute("data-key-value", key); // Store the original key value as a data attribute for potential future use.

    dates.forEach((date) => {
      // For each date, create a data cell with the corresponding value for the current key.
      const value = data[date][key]; // Get the value for the current date and key from the data object.
      const dataCell = createTableCell(value, date, key); // Create a table cell based on the value type (boolean, number, or other).
      dataRow.appendChild(dataCell); // Append the created data cell to the current row.
    });
    tableElement.appendChild(dataRow); // Append the completed data row to the table element.
  });
}

/**
 * Creates a table data cell (<td>) based on the type of value.
 * Handles boolean, number, and other types differently.
 *
 * @param {*} value - The value to be displayed in the cell.
 * @param {string} date - The date associated with this cell's data.
 * @param {string} key - The key (metric) associated with this cell's data.
 * @returns {HTMLTableCellElement} The created table data cell element.
 */
function createTableCell(value, date, key) {
  const td = document.createElement("td"); // Create a standard table data cell element.

  if (typeof value === "boolean") {
    // Handle boolean values: display a checkbox-like indicator and make it interactive.
    setupBooleanCell(td, value, date, key); // Call function to set up the boolean cell.
  } else if (typeof value === "number") {
    // Handle number values: display the number with increment/decrement buttons.
    setupNumberCell(td, value, date, key); // Call function to set up the number cell with buttons.
  } else {
    // For any other value type (string, null, undefined, etc.), display the value as text.
    td.textContent = value || "-"; // Display the value if it exists, otherwise display "-" as a placeholder for null/undefined.
  }
  return td; // Return the created and configured table cell.
}

/**
 * Sets up a table cell to display and handle boolean values.
 * Makes the cell interactive to toggle the boolean value on click.
 *
 * @param {HTMLTableCellElement} td - The table cell element to configure.
 * @param {boolean} initialValue - The initial boolean value to display.
 * @param {string} date - The date associated with this cell's data.
 * @param {string} key - The key (metric) associated with this cell's data.
 */
function setupBooleanCell(td, initialValue, date, key) {
  td.textContent = initialValue ? "✓" : ""; // Display "✓" for true, nothing for false.
  td.style.backgroundColor = initialValue ? "aquamarine" : ""; // Set background color based on value.
  td.setAttribute("data-cell-type", "boolean"); // Mark cell type as boolean for potential future handling.
  td.setAttribute("data-date-value", date); // Store date for easy access in event handlers.
  td.setAttribute("data-key-value", key); // Store key for easy access in event handlers.
  td.underlyingValue = initialValue; // Store the actual boolean value as a property of the cell for easy access and modification.

  td.addEventListener("click", () => {
    // Add a click event listener to toggle the boolean value.
    console.log(
      "Boolean Cell clicked - Date:",
      date,
      "Key:",
      key,
      "Current Value:",
      td.underlyingValue
    ); // Debug log on click.
    td.underlyingValue = !td.underlyingValue; // Toggle the underlying boolean value.
    td.textContent = td.underlyingValue ? "✓" : ""; // Update the text content based on the new value.
    td.style.backgroundColor = td.underlyingValue ? "aquamarine" : ""; // Update background color.

    // Update the fetchedData object to reflect the change.
    fetchedData[date][key] = td.underlyingValue; // Update the value in the fetchedData object.
    printDebug(
      `Updated data for Date: ${date}, Key: ${key} to ${td.underlyingValue}`
    ); // Debug log after data update.
    printDebug(
      `Current fetchedData state: ${JSON.stringify(fetchedData, null, 2)}`
    ); // Log the updated fetchedData.
  });
}

/**
 * Sets up a table cell to display and handle number values with increment and decrement buttons.
 *
 * @param {HTMLTableCellElement} td - The table cell element to configure.
 * @param {number} initialValue - The initial number value to display.
 * @param {string} date - The date associated with this cell's data.
 * @param {string} key - The key (metric) associated with this cell's data.
 */
function setupNumberCell(td, initialValue, date, key) {
  td.className = "number-cell"; // Apply CSS class for styling number cells.
  td.textContent = initialValue; // Set the initial text content of the cell to the number value.
  td.setAttribute("data-cell-type", "number"); // Mark cell type as number.
  td.setAttribute("data-date-value", date); // Store date as data attribute.
  td.setAttribute("data-key-value", key); // Store key as data attribute.

  const decrementButton = createButton("-", "decrement-button"); // Create decrement button.
  const incrementButton = createButton("+", "increment-button"); // Create increment button.

  // Add event listener to decrement button
  decrementButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent cell click event from triggering when button is clicked.
    updateNumberValue(td, date, key, -1); // Call function to update value with decrement.
  });

  // Add event listener to increment button
  incrementButton.addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent cell click event from triggering when button is clicked.
    updateNumberValue(td, date, key, 1); // Call function to update value with increment.
  });

  td.appendChild(decrementButton); // Append decrement button to the cell.
  td.appendChild(incrementButton); // Append increment button to the cell.
}

/**
 * Creates a button element (span) with given text and class name.
 * Used for increment and decrement buttons in number cells.
 *
 * @param {string} text - The text to display on the button.
 * @param {string} className - The CSS class name for styling.
 * @returns {HTMLSpanElement} The created button element.
 */
function createButton(text, className) {
  const button = document.createElement("span"); // Create a span element to act as a button.
  button.textContent = text; // Set the text content of the button.
  button.className = className; // Set the CSS class name for styling.
  return button; // Return the created button element.
}

/**
 * Updates the number value in the cell, fetchedData, and displays the updated value.
 *
 * @param {HTMLTableCellElement} td - The table cell element containing the number.
 * @param {string} date - The date associated with this cell's data.
 * @param {string} key - The key (metric) associated with this cell's data.
 * @param {number} change - The amount to change the number value by (e.g., 1 for increment, -1 for decrement).
 */
function updateNumberValue(td, date, key, change) {
  let currentValue = Number(td.textContent); // Get the current number value from the cell's text content and convert to Number.
  if (isNaN(currentValue)) {
    console.error("Current cell value is not a number:", td.textContent); // Error log if the cell text is not a valid number.
    return; // Exit function if current value is not a number to prevent NaN issues.
  }

  const newValue = currentValue + change; // Calculate the new value by adding the change.
  td.textContent = newValue; // Update the cell's text content with the new value.
  fetchedData[date][key] = newValue; // Update the value in the fetchedData object.

  printDebug(
    `Updated number value for Date: ${date}, Key: ${key} to ${newValue}`
  ); // Debug log of the update.
  printDebug(
    `Current fetchedData state: ${JSON.stringify(fetchedData, null, 2)}`
  ); // Log the updated fetchedData state.
}

/**
 * Event listener for DOMContentLoaded event.
 * Initializes the page by fetching data and setting up event listeners for buttons.
 */
document.addEventListener("DOMContentLoaded", () => {
  fetchData(-5); // Fetch data with an offset of -5 when the page loads.
  printDebug("Page was loaded and DOM content is fully parsed."); // Debug log on page load.

  // --- Event Listeners ---
  // Ensure button elements are found before adding event listeners to prevent errors.
  if (fetchButton) {
    fetchButton.addEventListener("click", () => {
      // Add event listener to the fetch button.
      fetchData(-5); // Fetch data again when the fetch button is clicked (same offset as initial load).
    });
  } else {
    console.error(`Button with ID '${fetchButtonId}' not found.`); // Log error if fetch button is not found.
  }

  if (pushButton) {
    pushButton.addEventListener("click", () => {
      // Add event listener to the push button.
      pushDataToServer(fetchedData); // Call function to push the current fetchedData to the server.
    });
  } else {
    console.error(`Button with ID '${pushButtonId}' not found.`); // Log error if push button is not found.
  }
});

/**
 * Function to push the modified data back to the server.
 *
 * @param {object} data - The data object to be pushed to the server.
 */
async function pushDataToServer(data) {
  const url = `${apiUrl}/api/yaml-data`; // Define the API endpoint for pushing data.

  try {
    const response = await fetch(url, {
      // Use fetch API to send a POST request.
      method: "POST", // Specify POST method for sending data to the server.
      headers: {
        "Content-Type": "application/json", // Set Content-Type header to indicate JSON data.
      },
      body: JSON.stringify(data), // Serialize the data object to JSON format and set as the request body.
    });

    if (!response.ok) {
      // Check if the HTTP response status indicates an error.
      throw new Error(`HTTP error! status: ${response.status}`); // Throw error if response status is not in the success range.
    }

    const responseData = await response.json(); // Parse the JSON response from the server.
    console.log("Data successfully pushed to server:", responseData); // Log success message and response data.
    // TODO: Implement user feedback to indicate successful push (e.g., a notification).
  } catch (error) {
    console.error("Error pushing data to server:", error); // Log any errors that occur during the push process.
    // TODO: Implement user-friendly error display for push failures.
  }
}
