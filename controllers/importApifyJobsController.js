// controllers/apifyImport.controller.js

const importApifyJobs = require("../services/importApifyJobsService");
const { fetchApifyJobs } = require("../utils/apifyClient");

/**
 * Controller that:
 * 1. Fetches jobs from Apify
 * 2. Transforms jobs
 * 3. Saves into DB
 */
exports.importFromApify = async (req, res) => {
  try {
    const { apifyUrl } = req.body;
    const employerId = req.user.id;

    if (!apifyUrl) {
      return res.status(400).json({ error: "apifyUrl is required" });
    }

    // 1. Fetch jobs from Apify API
    const apifyJobsArray = await fetchApifyJobs(apifyUrl);

    // 2. Transform + Save
    const summary = await importApifyJobs(apifyJobsArray, employerId);

    res.status(200).json({
      message: "Import completed",
      summary,
    });
  } catch (err) {
    res.status(500).json({
      error: "Apify import failed",
      details: err.message,
    });
  }
};
