const crypto = require("crypto");
const { createJob, getJob } = require("../redis/schema/jobQueue.js");

const ingestJob = async (req, res) => {
  const { payload, max_attempts } = req.body;

  if (!payload) {
    return res.status(400).json({ error: "payload is required" });
  }

  const jobId = crypto.randomUUID();

  await createJob(jobId, payload, max_attempts);

  res.status(202).json({
    jobId,
    status: "pending",
  });
};

const getJobStatus = async (req, res) => {
  const { jobId } = req.params;

  const job = await getJob(jobId);

  if (!job) {
    return res.status(404).json({ error: "job not found" });
  }

  res.json(job);
};

module.exports = { ingestJob, getJobStatus };
