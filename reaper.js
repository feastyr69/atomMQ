const redisClient = require("./redis/client.js");
const {
  getProcessingJobs,
  isLockAlive,
  requeueJob,
  pollDelayedJobs,
} = require("./redis/schema/jobQueue.js");

const REAP_INTERVAL_MS = 40 * 1000;
const DELAYED_POLL_INTERVAL_MS = 1000;

const reapProcessingJobs = async () => {
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
};

const promoteDelayedJobs = async () => {
  const promoted = await pollDelayedJobs();
  if (promoted > 0) {
    console.log(`[reaper] promoted ${promoted} delayed jobs to pending`);
  }
};

const runPeriodically = (task, intervalMs, label) => {
  const run = async () => {
    try {
      await task();
    } catch (err) {
      console.error(`[reaper] ${label} error:`, err.message);
    } finally {
      setTimeout(run, intervalMs);
    }
  };

  run();
};

const run = async () => {
  await redisClient.connect();
  console.log("[reaper] connected to Redis");

  await Promise.all([reapProcessingJobs(), promoteDelayedJobs()]);

  console.log(`[reaper] checking processing locks every ${REAP_INTERVAL_MS / 1000}s`);
  console.log(`[reaper] checking delayed jobs every ${DELAYED_POLL_INTERVAL_MS / 1000}s`);
  runPeriodically(reapProcessingJobs, REAP_INTERVAL_MS, "processing recovery");
  runPeriodically(promoteDelayedJobs, DELAYED_POLL_INTERVAL_MS, "delayed-job promotion");
};

run().catch((err) => {
  console.error("[reaper] fatal error:", err);
  process.exit(1);
});

