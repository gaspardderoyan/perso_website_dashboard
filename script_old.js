// script.js
const apiUrl = "http://127.0.0.1:3000";
const DEBUG = false;

/**
 * Prints a debug message if debugging is enabled.
 *
 * @param {string} message - The message to print.
 */
function printDebug(message) {
  if (DEBUG) {
    console.log(message);
  }
}

// Get references to elements
const fetchButton = document.getElementById("fetchButton");
const responseElement = document.getElementById("response");
const dataTable = document.getElementById("dataTable");
const daysInput = document.getElementById("daysInput");
const pushButton = document.getElementById("pushButton");

// Fetch the data when the page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchData(-Number(daysInput.value), 0);
});

// Fetch data when the button is clicked
fetchButton.addEventListener("click", () => {
  fetchData(-Number(daysInput.value), 0);
});

// Push changes to the server when the button is clicked
pushButton.addEventListener("click", () => {
  responseElement.textContent = "Pushing changes to the server...";
  saveChanges();
});

// Get the days value element from the input
daysInput.addEventListener("input", () => {
  daysValue.textContent = daysInput.value;
});

// Get the current content text
let currentText = responseElement.textContent;

let fetchedData = {};

/**
 * Fetches data from the API and updates the UI.
 *
 * @param {number} startOffset - The starting offset in days from today.
 * @param {number} endOffset - The ending offset in days from today.
 */
function fetchData(startOffset, endOffset) {
  const url = `${apiUrl}/api/yaml-data?startOffset=${startOffset}&endOffset=${endOffset}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      // Display the data in the response element
      responseElement.textContent = "Data fetched successfully!";

      // Store the fetched data
      fetchedData = data;

      printDebug(`First fetched data: ${JSON.stringify(fetchedData)}`);

      // Display in the table
      displayDataInTable(data);
    })
    .catch((error) => {
      // Update response element with error message
      responseElement.textContent = `Error: ${error.message}`;
    });
}

/**
 * Displays data in the table.
 *
 * @param {Object} data - The data to display.
 */
function displayDataInTable(data) {
  // clear existing rows
  dataTable.innerHTML = "";

  // get the keys of the first object in the data
  const firstKey = Object.keys(data)[0]; // gets the 1st date
  const firstObject = data[firstKey]; // gets the data in the 1st date
  const allKeys = Object.keys(firstObject); // gets all the keys in the 1st date

  // stores keys but filters out 'modified'
  const headers = ["Date", ...allKeys.filter((key) => key !== "modified")];

  // Create and append table headers
  createTableHeaders(headers);

  // Create and append table rows
  createTableRows(data, headers);
}

/**
 * Creates and appends table headers.
 *
 * @param {string[]} headers - The headers to create.
 */
function createTableHeaders(headers) {
  // Create element for table header row
  const headerRow = document.createElement("tr");

  // Loop through each header and create a table header cell
  headers.forEach((header) => {
    const th = document.createElement("th"); // Create table header cell
    th.setAttribute("data-value", header); // Set the data-value attribute, lowercase
    th.textContent = (function (header) {
      return header[0].toUpperCase() + header.slice(1); // Capitalize the header text
    })(header);
    headerRow.appendChild(th); // Append the header cell to the header row
  });

  // Append the header row to the table
  dataTable.appendChild(headerRow);
}

/**
 * Creates and appends table rows.
 *
 * @param {Object} data - The data to display.
 * @param {string[]} headers - The headers to create.
 */
function createTableRows(data, headers) {
  // Populate the table rows
  // Loop through each date in the data
  Object.keys(data).forEach((date) => {
    const row = document.createElement("tr"); // Create a new table row

    // store the date in a data attribute for easy retrieval
    row.setAttribute("data-date", date);
    // create table cell for the date
    const dateCell = document.createElement("td");
    dateCell.textContent = date;
    row.appendChild(dateCell);

    // Loop through each header and create a table cell for each
    headers.slice(1).forEach((header) => {
      // slice to avoid the 'Date'
      const td = document.createElement("td"); // Create a table cell
      td.setAttribute("data-key", header); // Set the data-key attribute
      let value = data[date][header]; // Get the value from the data
      renderCellData(td, value); // Render the cell data

      row.appendChild(td); // Append the cell to the row
    });

    // Append the row to the table
    dataTable.appendChild(row);
  });
}

let timer;
/**
 * Starts or resets the timer to 10 seconds.
 * If the timer elapses, it prints a message to the console.
 */
function startOrResetTimer() {
  // Clear any existing timer
  clearTimeout(timer);

  let seconds = 5;
  let milliseconds = seconds * 1000;

  // Start a new timer
  timer = setTimeout(() => {
    console.log(`${seconds} seconds have elapsed since the last modification.`);
    responseElement.textContent = "Pushing changes to the server...";
    // wait 1 second before saving changes
    printDebug(`fetchedData (before saving): ${JSON.stringify(fetchedData)}`);
    saveChanges();
    printDebug(`fetchedData (after saving): ${JSON.stringify(fetchedData)}`);
  }, milliseconds);
}

/**
 * Renders cell data based on its type.
 *
 * @param {HTMLElement} td - The table cell element.
 * @param {any} value - The value to render.
 */
function renderCellData(td, value) {
  td.setAttribute("data-value", value);

  if (typeof value === "number") {
    renderNumberCell(td, value);
  } else {
    renderBooleanCell(td, value);
  }
}

/**
 * Renders a number cell with increment and decrement buttons.
 *
 * @param {HTMLElement} td - The table cell element.
 * @param {number} value - The value to render.
 */
function renderNumberCell(td, value) {
  td.textContent = Number(value);

  const decrementButton = createButton(td, value, "decrement");
  const incrementButton = createButton(td, value, "increment");

  td.appendChild(decrementButton);
  td.appendChild(incrementButton);

  td.classList.add("number-cell");
}

/**
 * Creates a button for incrementing or decrementing a value.
 *
 * @param {HTMLElement} td - The table cell element.
 * @param {number} value - The value to increment or decrement.
 * @param {string} type - The type of button ("increment" or "decrement").
 * @returns {HTMLElement} The created button element.
 */
function createButton(td, value, type) {
  const button = document.createElement("span");
  button.textContent = type === "increment" ? "+" : "-";
  button.className =
    type === "increment" ? "increment-button" : "decrement-button";

  button.addEventListener("click", (event) => {
    event.stopPropagation();

    // find closest row, get its date from attr
    const row = td.closest("tr");
    const dateKey = row.getAttribute("data-date");
    const dataKey = td.getAttribute("data-key");

    // update the value in the data object
    value = type === "increment" ? value + 1 : value - 1;
    fetchedData[dateKey][dataKey] = value;

    // mark that row as modified
    fetchedData[dateKey].modified = true;

    // update the ui
    td.textContent = value;
    td.appendChild(createButton(td, value, "decrement"));
    td.appendChild(createButton(td, value, "increment"));
    startOrResetTimer();
    printDebug(`Fetched data as a string: ${JSON.stringify(fetchedData)}`);
  });

  return button;
}

/**
 * Renders a boolean cell with toggle functionality.
 *
 * @param {HTMLElement} td - The table cell element.
 * @param {boolean} value - The value to render.
 */
function renderBooleanCell(td, value) {
  td.textContent = value ? "Yes" : "No";

  td.addEventListener("click", () => {
    // **NEW**: find the closest row, then get its date from the attribute
    const row = td.closest("tr");
    const dateKey = row.getAttribute("data-date");
    const dataKey = td.getAttribute("data-key");

    // toggle the value in the data object
    value = value === true ? false : value === false ? null : true;
    // TODO here, should get fetchedData[dateKey][dataKey] instead of value
    fetchedData[dateKey][dataKey] = value;

    // **NEW**: mark that row as modified
    fetchedData[dateKey].modified = true;

    // update the ui
    td.textContent = value ? "Yes" : "No";
    td.setAttribute("data-value", value);
    startOrResetTimer();
    printDebug(`Fetched data as a string: ${JSON.stringify(fetchedData)}`);
  });
}
