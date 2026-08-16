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

//mutex

const LOCK_TTL_SECONDS = 300;

const acquireLock = async (jobId) => {
  const result = await redisClient.set(KEYS.lockKey(jobId), "active", {
    NX: true,
    EX: LOCK_TTL_SECONDS,
  });

  return result === "OK";
};

const acknowledgeJob = async (jobId) => {
  const multi = redisClient.multi();

  multi.lRem(KEYS.processingQueue, 1, jobId);
  multi.hSet(KEYS.jobHash(jobId), {
    status: "completed",
    updated_at: String(Date.now()),
  });
  multi.del(KEYS.lockKey(jobId));

  return multi.exec();
};

const incrementAttempts = async (jobId) => {
  return redisClient.hIncrBy(KEYS.jobHash(jobId), "attempts", 1);
};

const isLockAlive = async (jobId) => {
  const exists = await redisClient.exists(KEYS.lockKey(jobId));
  return exists === 1;
};

const requeueJob = async (jobId) => {
  const multi = redisClient.multi();

  multi.lRem(KEYS.processingQueue, 1, jobId);
  multi.lPush(KEYS.pendingQueue, jobId);
  multi.hSet(KEYS.jobHash(jobId), {
    status: "pending",
    updated_at: String(Date.now()),
  });

  return multi.exec();
};

const moveToDelayed = async (jobId, executeAt) => {
  const multi = redisClient.multi();

  multi.lRem(KEYS.processingQueue, 1, jobId);
  multi.zAdd(KEYS.delayedQueue, { score: executeAt, value: jobId });
  multi.del(KEYS.lockKey(jobId));
  multi.hSet(KEYS.jobHash(jobId), {
    status: "delayed",
    updated_at: String(Date.now()),
  });

  return multi.exec();
};

const moveToDeadLetter = async (jobId) => {
  const multi = redisClient.multi();

  multi.lRem(KEYS.processingQueue, 1, jobId);
  multi.lPush(KEYS.deadLetterQueue, jobId);
  multi.del(KEYS.lockKey(jobId));
  multi.hSet(KEYS.jobHash(jobId), {
    status: "failed",
    updated_at: String(Date.now()),
  });

  return multi.exec();
};

const pollDelayedJobs = async () => {
  const now = Date.now();
  const readyJobIds = await redisClient.zRangeByScore(
    KEYS.delayedQueue,
    "-inf",
    String(now)
  );

  for (const jobId of readyJobIds) {
    const multi = redisClient.multi();

    multi.zRem(KEYS.delayedQueue, jobId);
    multi.lPush(KEYS.pendingQueue, jobId);
    multi.hSet(KEYS.jobHash(jobId), {
      status: "pending",
      updated_at: String(now),
    });

    await multi.exec();
  }

  return readyJobIds.length;
};

module.exports = {
  createJob,
  getJob,
  updateJobStatus,
  checkoutJob,
  getPendingCount,
  getProcessingCount,
  getProcessingJobs,
  acquireLock,
  acknowledgeJob,
  incrementAttempts,
  isLockAlive,
  requeueJob,
  moveToDelayed,
  moveToDeadLetter,
  pollDelayedJobs,
};
