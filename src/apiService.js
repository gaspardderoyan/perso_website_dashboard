// apiService.js
import { config } from "./config.js";
const { apiUrl } = config;
import { printDebug } from "./utils.js";

// TODO: write comment
export async function getKey(passwordInput) {
  let password = passwordInput.value.trim();
  const url = `${apiUrl}/generate_api_key`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password : password })
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Clear the input and notify the user about the wrong password.
      passwordInput.value = "";
      passwordInput.placeholder = "Wrong password";
      return null;
    } else {
      const errorMessage = `HTTP error! status: ${response.status}`;
      console.error("Fetch error:", errorMessage);
      return null;
    }
  }

  const data = await response.json();
  const key = data["api_key"];
  return key;
}

/**
 * Function to fetch data from the API.
 * @param {number} offset - The offset to use for fetching data.
 * @param {string} key - The API key.
 */
export async function fetchData(offset, key) {
  // Construct the API URL
  const encodedKey = encodeURIComponent(key);
  const url = `${apiUrl}/get_habits?prev=${offset}&next=0&key=${encodedKey}`;
  // Log the URL for debugging purposes
  printDebug(`Fetching data from: ${url}`);

  try {
    // Send a GET request to the API
    const response = await fetch(url);
    // Check if the response is not OK (status code not in the range 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    // Parse the response JSON data
    const data = await response.json();
    // Log the success message
    printDebug("Data fetched successfully:");
    return data;
  } catch (error) {
    // Log the error message to the console
    console.error(`Fetch error: ${error.message}`);
  }
}

/**
 * Function to push data to the server.
 * @param {Object} data - The data to push.
 * @param {string} key - The API key.
 */
export async function pushDataToServer(data, key) {
  const encodedKey = encodeURIComponent(key);
  const url = `${apiUrl}/update_habits?key=${encodedKey}&habits=${JSON.stringify(data)}`;
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseData = await response.json();
    console.log("Response from server: ", responseData);
  } catch (error) {
    console.error("Error pushing data to server: ", error);
  }
}
