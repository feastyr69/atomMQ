const redisClient = require("./redis/client.js");
const {
  checkoutJob,
  updateJobStatus,
  getJob,
  acquireLock,
  acknowledgeJob,
  incrementAttempts,
} = require("./redis/schema/jobQueue.js");

const POLL_TIMEOUT = 5;

/**
 * Simulate heavy processing (e.g. calling a third-party API).
 * Resolves after 2-3 seconds, or randomly throws an error ~20% of the time
 * to simulate transient failures.
 */
const simulateWork = (jobId, payload) => {
  return new Promise((resolve, reject) => {
    const delayMs = 2000 + Math.random() * 1000; // 2-3 seconds

    setTimeout(() => {
      if (Math.random() < 0.2) {
        reject(new Error(`Simulated failure for job ${jobId}`));
      } else {
        resolve();
      }
    }, delayMs);
  });
};

const processJob = async (jobId) => {
  // Step 1: Acquire distributed lock (SETNX with 300s TTL)
  const locked = await acquireLock(jobId);
  if (!locked) {
    console.log(`[worker] job ${jobId} is locked by another worker, skipping`);
    return;
  }

  // Step 2: Mark as active and increment attempts
  await updateJobStatus(jobId, "active");
  await incrementAttempts(jobId);

  const job = await getJob(jobId);
  console.log(`[worker] processing job ${jobId}`, job.payload);

  // Step 3: Execute the work
  await simulateWork(jobId, job.payload);

  // Step 4: Atomic acknowledgment (LREM + HSET completed + DEL lock)
  await acknowledgeJob(jobId);
  console.log(`[worker] job ${jobId} completed successfully`);
};

const run = async () => {
  await redisClient.connect();
  console.log("[worker] connected to Redis, waiting for jobs...");

  while (true) {
    try {
      const jobId = await checkoutJob(POLL_TIMEOUT);

      if (!jobId) continue;

      console.log(`[worker] checked out job ${jobId}`);
      await processJob(jobId);
    } catch (err) {
      console.error("[worker] error:", err.message);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
};

run().catch((err) => {
  console.error("[worker] fatal error:", err);
  process.exit(1);
});
