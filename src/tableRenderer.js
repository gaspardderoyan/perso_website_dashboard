import { resetPushTimer } from "./main.js";
import { config } from "./config.js";

export function createHeaderRow(dates) {
  const headerRow = document.createElement("tr");
  const habitHeader = document.createElement("th");
  habitHeader.textContent = "Habits";
  habitHeader.classList.add("habit-cell");
  headerRow.appendChild(habitHeader);

  dates.forEach((date) => {
    const dateHeader = document.createElement("th");
    const dateHeaderDiv = document.createElement("div");
    dateHeaderDiv.className = "date-header";

    const dateObj = new Date(date);
    const month = dateObj.toLocaleString("en-US", { month: "short" });
    const day = dateObj.getDate();
    const weekday = dateObj.toLocaleString("en-US", { weekday: "short" });

    const monthDiv = document.createElement("div");
    monthDiv.className = "month";
    monthDiv.textContent = month;

    const dayDiv = document.createElement("div");
    dayDiv.className = "day";
    dayDiv.textContent = day;

    const weekdayDiv = document.createElement("div");
    weekdayDiv.className = "weekday";
    weekdayDiv.textContent = weekday;

    dateHeaderDiv.appendChild(monthDiv);
    dateHeaderDiv.appendChild(dayDiv);
    dateHeaderDiv.appendChild(weekdayDiv);

    dateHeader.appendChild(dateHeaderDiv);

    if (new Date().toISOString().split("T")[0] === date) {
      dateHeader.classList.add("today");
    }
    headerRow.appendChild(dateHeader);
  });

  return headerRow;
}

export function createDataRow(habit, dates, fetchedData) {
  const dataRow = document.createElement("tr");
  const habitCell = document.createElement("td");
  if (habit in config.habitsEmojis) {
    habitCell.textContent = config.habitsEmojis[habit] + "  " + habit;
  } else {
    habitCell.textContent = habit;
  }
  habitCell.classList.add("habit-cell");
  dataRow.appendChild(habitCell);

  dates.forEach((date) => {
    const dataCell = createTableCell(date, habit, fetchedData);
    if (new Date().toISOString().split("T")[0] === date) {
      dataCell.classList.add("today");
    }
    dataRow.appendChild(dataCell);
  });

  return dataRow;
}

export function displayDataInTable(dataTable, fetchedData, habitsOrder) {
  if (!dataTable) {
    console.error(`Table with ID not found.`);
    return;
  }

  dataTable.innerHTML = "";

  const dates = Object.keys(fetchedData).sort();
  const headerRow = createHeaderRow(dates);
  dataTable.appendChild(headerRow);

  habitsOrder.forEach((habit) => {
    const dataRow = createDataRow(habit, dates, fetchedData);
    dataTable.appendChild(dataRow);
  });
}

export function createTableCell(date, habit, fetchedData) {
  let value = fetchedData[date][habit];
  const td = document.createElement("td");
  if (typeof value === "boolean") {
    handleBooleanCell(td, value, date, habit, fetchedData);
  } else if (typeof value === "number") {
    handleNumberCell(td, value, date, habit, fetchedData);
  }
  return td;
}

export function handleBooleanCell(td, value, date, habit, fetchedData) {
  td.classList.add("boolean");

  const createCheckmarkSVG = () => {
    // Create an SVG element in the SVG namespace
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // Set the SVG namespace attribute
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    // Set the viewBox to define coordinate system (24x24 units)
    svg.setAttribute("viewBox", "0 0 24 24");
    // Set the display dimensions to 24x24 pixels
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");

    // Create a path element for the checkmark shape
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // Set the path data - defines a checkmark using SVG path commands
    // The path draws a checkmark using curves and lines with specific stroke width
    path.setAttribute(
      "d",
      "M21.03 5.72a.75.75 0 0 1 0 1.06l-11.5 11.5a.747.747 0 0 1-1.072-.012l-5.5-5.75a.75.75 0 1 1 1.084-1.036l4.97 5.195L19.97 5.72a.75.75 0 0 1 1.06 0Z"
    );
    // Add the path as a child of the SVG element
    svg.appendChild(path);

    return svg;
  };

  const updateBooleanCell = () => {
    td.innerHTML = "";
    if (value) {
      td.appendChild(createCheckmarkSVG());
      td.classList.add("checked-cell");
    } else {
      td.classList.remove("checked-cell");
    }
  };

  updateBooleanCell();

  td.addEventListener("click", () => {
    value = !value;
    fetchedData[date][habit] = value;
    updateBooleanCell();
    resetPushTimer(); // Reset timer on click
  });
}

export function handleNumberCell(td, value, date, habit, fetchedData) {
  td.classList.add("number-cell");
  const valueSpan = document.createElement("span");
  valueSpan.textContent = value;
  td.appendChild(valueSpan);

  const updateNonZeroClass = () => {
    if (value !== 0) {
      td.classList.add("non-zero-cell");
    } else {
      td.classList.remove("non-zero-cell");
    }
  };

  updateNonZeroClass();

  const decrementButton = createButton("-", "decrement-button");
  const incrementButton = createButton("+", "increment-button");

  decrementButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (value > 0) {
      value--;
      fetchedData[date][habit] = value;
      valueSpan.textContent = value;
      updateNonZeroClass();
      resetPushTimer(); // Reset timer on click
    }
  });

  incrementButton.addEventListener("click", (event) => {
    event.stopPropagation();
    value++;
    fetchedData[date][habit] = value;
    valueSpan.textContent = value;
    updateNonZeroClass();
    resetPushTimer(); // Reset timer on click
  });

  td.appendChild(decrementButton);
  td.appendChild(incrementButton);
}

export function createButton(text, className) {
  const button = document.createElement("span");
  button.textContent = text;
  button.className = className;
  return button;
}
