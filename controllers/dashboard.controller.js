const {
  getPendingCount,
  getProcessingCount,
  getDelayedCount,
  getDeadLetterCount,
  getPendingJobs,
  getProcessingJobs,
  getDelayedJobs,
  getDeadLetterJobs,
  getJob,
} = require("../redis/schema/jobQueue.js");

const getStats = async (req, res) => {
  try {
    const [pending, processing, delayed, deadLetter] = await Promise.all([
      getPendingCount(),
      getProcessingCount(),
      getDelayedCount(),
      getDeadLetterCount(),
    ]);

    res.json({ pending, processing, delayed, deadLetter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRecentJobs = async (req, res) => {
  try {
    const [pendingIds, processingIds, delayedIds, deadLetterIds] =
      await Promise.all([
        getPendingJobs(),
        getProcessingJobs(),
        getDelayedJobs(),
        getDeadLetterJobs(),
      ]);

    const allIds = [
      ...new Set([
        ...pendingIds,
        ...processingIds,
        ...delayedIds,
        ...deadLetterIds,
      ]),
    ];

    const jobs = await Promise.all(
      allIds.slice(0, 50).map(async (id) => {
        const job = await getJob(id);
        return job;
      })
    );

    res.json(jobs.filter(Boolean));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getStats, getRecentJobs };
