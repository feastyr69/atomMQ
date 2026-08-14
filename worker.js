const redisClient = require("./redis/client.js");
const { checkoutJob, updateJobStatus, getJob } = require("./redis/schema/jobQueue.js");

const POLL_TIMEOUT = 5;

const processJob = async (jobId) => {
  await updateJobStatus(jobId, "active");
  const job = await getJob(jobId);
  console.log(`[worker] processing job ${jobId}`, job.payload);
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
