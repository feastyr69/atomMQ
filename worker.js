const redisClient = require("./redis/client.js");
const {
  checkoutJob,
  updateJobStatus,
  getJob,
  acquireLock,
  acknowledgeJob,
  incrementAttempts,
  moveToDelayed,
  moveToDeadLetter,
} = require("./redis/schema/jobQueue.js");

const POLL_TIMEOUT = 5;

const simulateWork = (jobId, payload) => {
  return new Promise((resolve, reject) => {
    const delayMs = 2000 + Math.random() * 1000;

    setTimeout(() => {
      if (Math.random() < 0.2) {           //20% chance of failure
        reject(new Error(`Simulated failure for job ${jobId}`));
      } else {
        resolve();
      }
    }, delayMs);
  });
};

const processJob = async (jobId) => {
  const locked = await acquireLock(jobId);
  if (!locked) {
    console.log(`[worker] job ${jobId} is locked by another worker, skipping`);
    return;
  }

  await updateJobStatus(jobId, "active");
  await incrementAttempts(jobId);

  const job = await getJob(jobId);
  console.log(`[worker] processing job ${jobId}`, job.payload);

  try {
    await simulateWork(jobId, job.payload);
    await acknowledgeJob(jobId);
    console.log(`[worker] job ${jobId} completed successfully`);
  } catch (err) {
    console.error(`[worker] job ${jobId} failed: ${err.message}`);

    //exponential retry logic
    if (job.attempts < job.max_attempts) {
      const delayMs = Math.pow(2, job.attempts) * 1000;
      const executeAt = Date.now() + delayMs;
      await moveToDelayed(jobId, executeAt);
      console.log(`[worker] job ${jobId} delayed for ${delayMs}ms (attempt ${job.attempts}/${job.max_attempts})`);
    } else {
      await moveToDeadLetter(jobId);
      console.log(`[worker] job ${jobId} moved to dead-letter queue (exhausted ${job.max_attempts} attempts)`);
    }
  }
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
