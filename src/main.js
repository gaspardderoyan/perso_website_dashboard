import "./style.css";
import { setupPasswordInput } from "./password.js";
import { getKey, fetchData, pushDataToServer } from "./apiService.js";
import { displayDataInTable } from "./tableRenderer.js";
import { config } from "./config.js";

let currentPassword = "";
let apiKey = "";
let fetchedData = {};
let pushTimer;
const { habitsOrder } = config;

export function resetPushTimer() {
  // if there's already one when called, resets it
  if (pushTimer) {
    clearTimeout(pushTimer);
    pushTimer = null;
  }
  // Start a new 5-second timer
  pushTimer = setTimeout(() => {
    console.log("5 seconds elapsed");
    pushDataToServer(fetchedData, apiKey);
    // call pushDataToServer
  }, 5000);
}

document.querySelector("#app").innerHTML = /*html*/ `
  <div class ="container">
    <h1>Simple API Dashboard</h1>
    <p id="subtitle">Dashboard to track my habits</p>  
    <input type="password" id="passwordInput" placeholder="Enter password">
    <table id="dataTable"></table>
  </div>
  <div class="alert">Some text!</div>
`;

// passwd input element
const passwordInput = document.querySelector("#passwordInput");
// TODO: why doesn't this work with query selector?
const dataTable = document.getElementById("dataTable");

// Initialize the password input with a callback function
// This callback will be executed when Enter is pressed in the input
setupPasswordInput(passwordInput, async (password) => {
  // when the 'enter' is pressed, this gets called w/ the field value as 'password'
  currentPassword = password;
  console.log("Password updated!");

  // fetch the api key
  apiKey = await getKey(passwordInput);
  if (apiKey) {
    console.log("Password accepted!");
    currentPassword = ""; // delete password
    passwordInput.classList.add("hidden"); // hide password field

    // Add a timeout to set display: none after the transition completes
    setTimeout(() => {
      passwordInput.style.display = "none";
    }, 500); // 500ms matches the transition duration in CSS
    // fetch data, store it in global var
    fetchedData = await fetchData(-6, apiKey);
    console.log(fetchedData);
    // TODO: only if data not empty, display table
    displayDataInTable(dataTable, fetchedData, habitsOrder);
    dataTable.classList.add("visible"); // show table
  }
});

// runs on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page was loaded and DOM content parsed!");
  passwordInput.focus();
});
