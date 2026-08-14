const express = require("express");
const { ingestJob, getJobStatus } = require("../controllers/job.controller.js");

const router = express.Router();

router.post("/", ingestJob);
router.get("/:jobId", getJobStatus);

module.exports = router;
