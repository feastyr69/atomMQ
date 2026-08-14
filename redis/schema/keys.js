const KEYS = {
  jobHash: (jobId) => `job:${jobId}`,
  lockKey: (jobId) => `lock:job:${jobId}`,
  pendingQueue: "queue:pending",
  processingQueue: "queue:processing",
};

module.exports = KEYS;
