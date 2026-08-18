const express = require("express");
const { getStats, getRecentJobs } = require("../controllers/dashboard.controller.js");

const router = express.Router();

router.get("/stats", getStats);
router.get("/jobs", getRecentJobs);

module.exports = router;
