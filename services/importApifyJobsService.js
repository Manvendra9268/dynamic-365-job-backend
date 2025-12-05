/**
 * importApifyJobs.service.js
 * ---------------------------------------------------------
 * PRODUCTION-GRADE INGESTION SERVICE FOR APIFY JOBS
 *
 * - Loads array of Apify jobs
 * - Applies transformApifyJobToJobRequest()
 * - Saves to MongoDB using JobRequest model
 * - De-dupes based on (organization + jobTitle + country)
 * - Supports updateIfExists behavior
 * - Handles batching for high performance
 * - Returns detailed import summary
 */

const JobRequest = require("../models/JobRequest");
const { transformApifyJobToJobRequest } = require("../utils/transformApifyJob");

/* ============================================================
   1. SAVE TRANSFORMED JOB (INSERT OR UPDATE)
   ============================================================ */

async function saveTransformedJob(transformedJob, employerId = null) {
  // Attach employerId if provided
  if (employerId) transformedJob.employerId = employerId;

  let query = {};

  if(transformedJob.status) query.status = transformedJob.status;

  if (transformedJob.apifyJobId) {
    query.apifyJobId = transformedJob.apifyJobId;
  } else {
    query = {
      jobTitle: transformedJob.jobTitle,
      organization: transformedJob.organization,
      country: transformedJob.country,
    };
  }

  // Check existing
  let existingJob = await JobRequest.findOne(query);

  if (existingJob) {
    // ⛔ DO NOT UPDATE — JUST SKIP
    return { updated: false, created: false, skipped: true, jobId: existingJob._id };
  }

  // ---------------------------------------------
  // CREATE NEW RECORD
  // ---------------------------------------------
  const newJob = await JobRequest.create(transformedJob);

  return { updated: false, created: true, jobId: newJob._id };
}

/* ============================================================
   2. MAIN INGESTION FUNCTION
   ============================================================ */

async function importApifyJobs(apifyJobsArray, employerId = null) {
  const summary = {
    total: apifyJobsArray.length,
    created: 0,
    updated: 0,
    failed: 0,
    failures: [],
  };

  // Batch size for performance
  const BATCH_SIZE = 20;

  for (let i = 0; i < apifyJobsArray.length; i += BATCH_SIZE) {
    const batch = apifyJobsArray.slice(i, i + BATCH_SIZE);

    const promises = batch.map(async (job) => {
      try {
        // Transform job (PDF-accurate)
        const transformed = transformApifyJobToJobRequest(job);

        const result = await saveTransformedJob(transformed, employerId);

        if (result.created) summary.created++;
        if (result.updated) summary.updated++;
      } catch (err) {
        summary.failed++;
        summary.failures.push({
          jobIndex: i,
          error: err.message,
          job: job.title,
        });
      }
    });

    // Execute batch in parallel
    await Promise.all(promises);
  }

  return summary;
}

/* ============================================================
   EXPORT
   ============================================================ */

module.exports = importApifyJobs;
