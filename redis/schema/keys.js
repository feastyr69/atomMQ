const KEYS = {
  jobHash: (jobId) => `job:${jobId}`,
  pendingQueue: "queue:pending",
  processingQueue: "queue:processing",
};

module.exports = KEYS;
