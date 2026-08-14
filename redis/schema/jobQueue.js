const redisClient = require("../client.js");
const KEYS = require("./keys.js");

const createJob = async (jobId, payload, maxAttempts = 3) => {
  const now = Date.now();
  const jobKey = KEYS.jobHash(jobId);

  const multi = redisClient.multi();

  multi.hSet(jobKey, {
    payload: JSON.stringify(payload),
    status: "pending",
    attempts: "0",
    max_attempts: String(maxAttempts),
    created_at: String(now),
    updated_at: String(now),
  });

  multi.lPush(KEYS.pendingQueue, jobId);

  const results = await multi.exec();
  return results;
};

const getJob = async (jobId) => {
  const data = await redisClient.hGetAll(KEYS.jobHash(jobId));
  if (!data || Object.keys(data).length === 0) return null;

  return {
    id: jobId,
    payload: JSON.parse(data.payload),
    status: data.status,
    attempts: parseInt(data.attempts, 10),
    max_attempts: parseInt(data.max_attempts, 10),
    created_at: parseInt(data.created_at, 10),
    updated_at: parseInt(data.updated_at, 10),
  };
};

const updateJobStatus = async (jobId, status) => {
  const jobKey = KEYS.jobHash(jobId);
  await redisClient.hSet(jobKey, {
    status,
    updated_at: String(Date.now()),
  });
};

const checkoutJob = async (timeoutSeconds = 0) => {
  const jobId = await redisClient.blMove(
    KEYS.pendingQueue,
    KEYS.processingQueue,
    "RIGHT",
    "LEFT",
    timeoutSeconds
  );
  return jobId;
};

const getPendingCount = async () => {
  return redisClient.lLen(KEYS.pendingQueue);
};

const getProcessingCount = async () => {
  return redisClient.lLen(KEYS.processingQueue);
};

const getProcessingJobs = async () => {
  return redisClient.lRange(KEYS.processingQueue, 0, -1);
};

module.exports = {
  createJob,
  getJob,
  updateJobStatus,
  checkoutJob,
  getPendingCount,
  getProcessingCount,
  getProcessingJobs,
};
