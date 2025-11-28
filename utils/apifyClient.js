// utils/apifyClient.js

const axios = require("axios");

/**
 * Fetches items from Apify Dataset or Actor Run
 * @param {String} apifyUrl - Full Apify API URL to items endpoint
 */
async function fetchApifyJobs(apifyUrl) {
  try {
    const response = await axios.get(apifyUrl, {
      headers: {
        "Accept": "application/json", 
      },
    });

    // Apify returns an array of items
    if (!Array.isArray(response.data)) {
      throw new Error("Invalid Apify response. Expected an array.");
    }

    return response.data;
  } catch (err) {
    console.error("❌ Error fetching Apify jobs:", err.message);
    throw err;
  }
}

module.exports = { fetchApifyJobs };
