const express = require("express");
const http = require("http");
const { WebSocketServer } = require("ws");
const cors = require("cors");
const limitRoutes = require("./routes/limit.route.js");
const jobRoutes = require("./routes/job.route.js");
const dashboardRoutes = require("./routes/dashboard.route.js");
const redisClient = require("./redis/client.js");
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
} = require("./redis/schema/jobQueue.js");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/v1/limit", limitRoutes);
app.use("/jobs", jobRoutes);
app.use("/v1/dashboard", dashboardRoutes);

// --- WebSocket for live dashboard updates ---
const wss = new WebSocketServer({ server });

const broadcastStats = async () => {
  if (wss.clients.size === 0) return;

  try {
    const [pending, processing, delayed, deadLetter] = await Promise.all([
      getPendingCount(),
      getProcessingCount(),
      getDelayedCount(),
      getDeadLetterCount(),
    ]);

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

    const jobs = (
      await Promise.all(allIds.slice(0, 50).map((id) => getJob(id)))
    ).filter(Boolean);

    const message = JSON.stringify({
      type: "dashboard_update",
      stats: { pending, processing, delayed, deadLetter },
      jobs,
    });

    for (const client of wss.clients) {
      if (client.readyState === 1) {
        client.send(message);
      }
    }
  } catch (err) {
    console.error("[ws] broadcast error:", err.message);
  }
};

let broadcastInterval;

wss.on("connection", (ws) => {
  console.log("[ws] client connected");
  broadcastStats(); // send initial data immediately

  if (!broadcastInterval) {
    broadcastInterval = setInterval(broadcastStats, 2000);
  }

  ws.on("close", () => {
    console.log("[ws] client disconnected");
    if (wss.clients.size === 0 && broadcastInterval) {
      clearInterval(broadcastInterval);
      broadcastInterval = null;
    }
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis successfully");
    server.listen(PORT, () => {
      console.log(`Rate limiter service running on port ${PORT}`);
      console.log(`WebSocket server running on ws://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    process.exit(1);
  }
};

startServer();
