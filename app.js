const express = require("express");
const limitRoutes = require("./routes/limit.route.js");
const jobRoutes = require("./routes/job.route.js");
const redisClient = require("./redis/client.js");

const app = express();
app.use(express.json());

app.use("/v1/limit", limitRoutes);
app.use("/jobs", jobRoutes);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis successfully");
    app.listen(PORT, () => {
      console.log(`Rate limiter service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to Redis:", error);
    process.exit(1);
  }
};

startServer();
