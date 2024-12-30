const apiUrl = "http://127.0.0.1:3000";

// Get references to elements
const fetchButton = document.getElementById("fetchButton");
const pushButton = document.getElementById("pushButton");
const responseElement = document.getElementById("response");
const dataTable = document.getElementById("dataTable");

// Add events listeners
fetchButton.addEventListener("click", () => fetchData(-4, 0));
pushButton.addEventListener("click", saveChanges);

// Run fetchData on page load
document.addEventListener("DOMContentLoaded", () => {
  fetchData(-4, 0);
});

// Get the current content text
let currentText = responseElement.textContent;

// Create a data object to store the fetched data
let fetchedDate = null;

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
      // Store the fetched data
      fetchedData = data;

      // Display the data in the response element
      responseElement.textContent = "Data fetched successfully";

      // Display in the table
      displayDataInTable(data);
    })
    .catch((error) => {
      // Update response element with error message
      responseElement.textContent = `Error: ${error.message}`;
    });
}

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

function createTableHeaders(headers) {
  // Create element for table header row
  const headerRow = document.createElement("tr");

  // Loop through each header and create a table header cell
  headers.forEach((header) => {
    const th = document.createElement("th"); // Create table header cell
    th.textContent = (function (header) {
      return header[0].toUpperCase() + header.slice(1); // Capitalize the header text
    })(header);
    headerRow.appendChild(th); // Append the header cell to the header row
  });

  // Append the header row to the table
  dataTable.appendChild(headerRow);
}

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
      let value = data[date][header]; // Get the value from the data
      td.setAttribute("data-key", header); // Set the data-key attribute to the header
      td.setAttribute("data-value", value); // Set the data-value attribute to the value
      if (typeof value === "number") {
        renderNumberCell(td, value);
      } else {
        renderBooleanCell(td, value);
      }

      row.appendChild(td); // Append the cell to the row
    });

    // Append the row to the table
    dataTable.appendChild(row);
  });
}

let timer;

function startOrResetTimer() {
  clearTimeout(timer); // clear existing timer

  timer = setTimeout(() => {
    console.log("10 seconds elapsed since last modification.");
    responseElement.textContent = "Pushing...";
    saveChanges();
  }, 5000);
}

function renderNumberCell(td, value) {
  td.textContent = Number(value);

  const decrementButton = createButton(td, value, "decrement");
  const incrementButton = createButton(td, value, "increment");

  td.appendChild(decrementButton);
  td.appendChild(incrementButton);

  td.classList.add("number-cell");
}

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
  });

  return button;
}

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
  });
}

function saveChanges() {
  // Get all modified dates and their data
  const modifiedData = Object.keys(fetchedData)
    .filter((date) => fetchedData[date].modified)
    .reduce((acc, date) => {
      acc[date] = fetchedData[date];
      return acc;
    }, {});

  Object.keys(modifiedData).forEach((date) => {
    delete modifiedData[date].modified;
  });

  if (Object.keys(modifiedData).length === 0) {
    responseElement.textContent = "No changes to save";
    return;
  }

  fetch("http://localhost:3000/api/update-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(modifiedData), // Send single object with updates
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((errorData) => {
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${errorData.message}`
          );
        });
      }
      return response.json();
    })
    .then((result) => {
      // Clear modified flags
      Object.keys(modifiedData).forEach((date) => {
        fetchedData[date].modified = false;
      });
      responseElement.textContent = "All changes saved successfully";
      console.log("Save result:", result);

      fetchData(-4, 0);
    })
    .catch((error) => {
      responseElement.textContent = `Error saving changes: ${error.message}`;
      console.error("Error:", error);
    });
}
