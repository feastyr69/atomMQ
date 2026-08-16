const redisClient = require("./redis/client.js");
const {
  getProcessingJobs,
  isLockAlive,
  requeueJob,
  pollDelayedJobs,
} = require("./redis/schema/jobQueue.js");

const REAP_INTERVAL_MS = 40 * 1000;

const reap = async () => {
  const processingJobs = await getProcessingJobs();

  if (processingJobs.length === 0) {
    console.log("[reaper] no jobs in processing queue");
  } else {
    console.log(`[reaper] scanning ${processingJobs.length} processing jobs`);

    for (const jobId of processingJobs) {
      const lockExists = await isLockAlive(jobId);

      if (!lockExists) {
        console.log(`[reaper] lock expired for job ${jobId}, requeuing`);
        await requeueJob(jobId);
      }
    }
  }

  const promoted = await pollDelayedJobs();
  if (promoted > 0) {
    console.log(`[reaper] promoted ${promoted} delayed jobs to pending`);
  }
};

const run = async () => {
  await redisClient.connect();
  console.log("[reaper] connected to Redis, scanning every 40s...");

  await reap();

  setInterval(async () => {
    try {
      await reap();
    } catch (err) {
      console.error("[reaper] error:", err.message);
    }
  }, REAP_INTERVAL_MS);
};

run().catch((err) => {
  console.error("[reaper] fatal error:", err);
  process.exit(1);
});

