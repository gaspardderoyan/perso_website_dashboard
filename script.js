// script.js
import { printDebug, formatDate } from "./utils.js";

const apiUrl = "http://127.0.0.1:3000";

// Get refs to elements
const dataTable = document.getElementById("dataTable");

// Fetch the data when the page loads
document.addEventListener("DOMContentLoaded", () => {
  fetchData(-5);
  printDebug("Page was loaded.");
  
  // Add button event listeners
  document.getElementById("fetchButton").addEventListener("click", () => {
    fetchData(-5);
  });
  
  document.getElementById("pushButton").addEventListener("click", () => {
    // TODO: Implement push functionality
    console.log("Push button clicked");
  });
});

// Var to store data
let fetchedData = {};

function fetchData(offset) {
  const url = `${apiUrl}/api/yaml-data?startOffset=${offset}&endOffset=0`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTT{ error status: ${response.status}}`);
      }
      return response.json();
    })
    .then((data) => {
      fetchedData = data;
      printDebug(JSON.stringify(fetchedData));
      // TODO
      displayDataInTable(data);
    })
    .catch((error) => {
      console.log(`Error: ${error.message}`);
    });
}

function displayDataInTable(data) {
  // Clear existing rows
  dataTable.innerHTML = "";

  const dates = Object.keys(data);
  const keys = [
    ...new Set(Object.values(data).flatMap((entry) => Object.keys(entry))),
  ];

  printDebug(`Dates:\n${dates}`);
  printDebug(`Keys:\n${keys}`);

  // Create header row
  const headerRow = document.createElement("tr");
  // Add empty cell for key column
  const emptyTh = document.createElement("th");
  emptyTh.textContent = "Metric";
  headerRow.appendChild(emptyTh);
  
  // Add date headers
  dates.forEach((date) => {
    const th = document.createElement("th");
    th.setAttribute("data-value", date);
    th.textContent = formatDate(date);
    headerRow.appendChild(th);
  });
  dataTable.appendChild(headerRow);

  // Create rows for each key
  keys.forEach((key) => {
    const row = document.createElement("tr");
    row.setAttribute("data-key", key);
    
    // Add key name as first cell
    const keyCell = document.createElement("td");
    keyCell.textContent = key;
    row.appendChild(keyCell);
    
    // Add cells for each date
    dates.forEach((date) => {
      const td = document.createElement("td");
      const value = data[date][key];
      td.setAttribute("data-key", key);
      
      if (typeof value === "boolean") {
        td.textContent = value ? "Yes" : "No";
        td.addEventListener("click", () => {
          const newValue = td.textContent === "Yes" ? false : true;
          td.textContent = newValue ? "Yes" : "No";
          data[date][key] = newValue;
          printDebug(`Updated data: ${JSON.stringify(data)}`);
        });
      } else if (typeof value === "number") {
        td.textContent = value;
        td.className = "number-cell";
        const decrementButton = createButton(td, value, "decrement");
        const incrementButton = createButton(td, value, "increment");
        td.appendChild(decrementButton);
        td.appendChild(incrementButton);
      } else {
        td.textContent = value || "-";
      }
      
      row.appendChild(td);
    });
    
    dataTable.appendChild(row);
  });
}

function createButton(td, value, type) {
  const button = document.createElement("span");
  button.textContent = type === "increment" ? "+" : "-";
  button.className = type === "increment" ? "increment-button" : "decrement-button";
  
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const row = td.closest("tr");
    const dateKey = row.previousSibling.getAttribute("data-value");
    const dataKey = td.getAttribute("data-key");
    
    value = type === "increment" ? value + 1 : value - 1;
    fetchedData[dateKey][dataKey] = value;
    
    td.textContent = value;
    td.appendChild(createButton(td, value, "decrement"));
    td.appendChild(createButton(td, value, "increment"));
    
    printDebug(`Updated data: ${JSON.stringify(fetchedData)}`);
  });
  
  return button;
}
