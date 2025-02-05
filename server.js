// server.js
import express from "express";
import cors from "cors"; // Import the cors middleware
import {
  getDateRange,
  getYAMLDataAsObjectFromDates,
  updateAllYAMLFiles
} from "./parsing_new.js";

const app = express();
const port = 3100; // Define the port where the server will run
const host = '0.0.0.0'; // This allows connections from any IP

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

let globalData = {};

app.get("/api/yaml-data", (req, res) => {
  // Extract startOffset and endOffset from query parameters, using default values if not provided
  const startOffset = req.query.startOffset;
  const endOffset = req.query.endOffset;

  // Define default values
  const defaultStartOffset = -5;
  const defaultEndOffset = 0;

  // Parse the query parameters to integers, using default values if parameters are not provided
  const start = startOffset === undefined ? defaultStartOffset : parseInt(startOffset, 10); // Convert startOffset to an integer or use default
  const end = endOffset === undefined ? defaultEndOffset : parseInt(endOffset, 10); // Convert endOffset to an integer or use default

  // Check if the parsed values are valid numbers (only if they are provided in the query, otherwise defaults are valid numbers)
  if ((startOffset !== undefined && isNaN(start)) || (endOffset !== undefined && isNaN(end))) {
    // Respond with HTTP 400 if provided parameters are not valid numbers
    return res
      .status(400)
      .json({ error: "startOffset and endOffset must be valid numbers if provided" });
  }

  // Try to process the request
  try {
    // Generate the date range using the imported function
    const datesArray = getDateRange(start, end);

    // Fetch YAML data for the generated date range
    globalData = getYAMLDataAsObjectFromDates(datesArray);

    // Respond with the fetched data as JSON
    res.json(globalData);
  } catch (error) {
    // Handle any errors during processing
    console.error("Error fetching YAML data:", error.message); // Log the error
    res.status(500).json({ error: "Internal server error" }); // Respond with HTTP 500 if an error occurs
  }
});


/**
 * Endpoint to update the global data
 * @param {Object} req - Express request object
 * @param {Object} req.body - The updates to be applied to globalData
 * @param {Object} res - Express response object
 */
app.post("/api/update-data", (req, res) => {
  const updates = req.body; // Expecting a single JSON object

  //console.log("Received updates:\n", updates);

  // Validate that updates is an object and not an array
  if (typeof updates !== "object" || Array.isArray(updates)) {
    return res
      .status(400)
      .json({ error: "Expected a single object with updates" });
  }

  const filteredDates = {};
  for (const date in updates) {
    if (globalData[date]) {
      const globalStr = JSON.stringify(globalData[date]);
      const updateStr = JSON.stringify(updates[date]);
      if (globalStr !== updateStr) {
        filteredDates[date] = updates[date];
      }
    }
  }

  console.log("Filtered updates:\n", filteredDates);

  try {
    updateAllYAMLFiles(filteredDates);
    Object.keys(filteredDates).forEach((date) => {
      globalData[date] = { ...globalData[date], ...filteredDates[date] };
    });
    res.status(200).json({ message: "Data updated successfully" }); // Send success response
  } catch (error) {
    console.error("Error updating data:", error); // Log the error
    res.status(500).json({ error: "Internal server error" }); // Send error response
  }
});

// Start the server and listen on the specified port
app.listen(port, host, () => {
  console.log(`Server is running on http://djivan.me:${port}`);
});


