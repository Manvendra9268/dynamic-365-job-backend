const importApifyJobs = require("../services/importApifyJobsService");
const { fetchApifyJobs } = require("../utils/apifyClient");
const dotenv = require("dotenv").config();
const CryptoJS = require("crypto-js");

function decrypt(encryptedText) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, process.env.ENCRYPTION_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
}

exports.importFromApify = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { encryptedDatasetId } = req.body;

    if (!encryptedDatasetId) {
      return res.status(400).json({ error: "encryptedDatasetId is required" });
    }

    // 1. Decrypt datasetId
    const datasetId = decrypt(encryptedDatasetId);

    if (!datasetId) {
      return res.status(400).json({ error: "Invalid encrypted datasetId" });
    }

    // 2. Build Apify dataset URL
    const apifyUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?clean=1&format=json&token=${process.env.APIFY_TOKEN}`;

    // 3. Fetch jobs from Apify
    const apifyJobsArray = await fetchApifyJobs(apifyUrl);

    // 4. Import into DB
    const summary = await importApifyJobs(apifyJobsArray, employerId);

    res.status(200).json({
      message: "Import completed",
      summary,
      itemsReceived: apifyJobsArray.length,
    });

  } catch (err) {
    res.status(500).json({
      error: "Apify import failed",
      details: err.message,
    });
  }
};
