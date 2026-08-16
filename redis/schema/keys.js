const KEYS = {
  jobHash: (jobId) => `job:${jobId}`,
  lockKey: (jobId) => `lock:job:${jobId}`,
  pendingQueue: "queue:pending",
  processingQueue: "queue:processing",
  delayedQueue: "queue:delayed",
  deadLetterQueue: "queue:dead-letter",
};

module.exports = KEYS;
