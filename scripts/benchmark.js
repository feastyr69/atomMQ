#!/usr/bin/env node

const { randomUUID } = require("node:crypto");

const DEFAULTS = {
  url: process.env.ATOMMQ_URL || `http://localhost:${process.env.PORT || 3000}`,
  jobs: 100,
  concurrency: 10,
  pollInterval: 1000,
  timeout: 10 * 60 * 1000,
};

const HELP = `AtomMQ end-to-end benchmark

Usage: npm run benchmark -- [options]

Options:
  --url <url>                API base URL (default: ${DEFAULTS.url})
  --jobs <count>             Jobs to submit (default: ${DEFAULTS.jobs})
  --concurrency <count>      Concurrent submissions and status checks (default: ${DEFAULTS.concurrency})
  --poll-interval <ms>       Delay between status checks (default: ${DEFAULTS.pollInterval})
  --timeout <ms>             Maximum completion wait (default: ${DEFAULTS.timeout})
  --help                     Show this help
`;

function parseArgs(args) {
  const options = { ...DEFAULTS };
  const values = {
    "--url": "url",
    "--jobs": "jobs",
    "--concurrency": "concurrency",
    "--poll-interval": "pollInterval",
    "--timeout": "timeout",
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") return { help: true };

    const key = values[arg];
    if (!key) throw new Error(`Unknown option: ${arg}`);
    const value = args[i + 1];
    if (!value || value.startsWith("--")) throw new Error(`Missing value for ${arg}`);
    i += 1;

    if (key === "url") {
      options.url = value.replace(/\/+$/, "");
      try {
        new URL(options.url);
      } catch {
        throw new Error(`Invalid URL: ${value}`);
      }
    } else {
      const parsed = Number(value);
      if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        throw new Error(`${arg} must be a positive integer`);
      }
      options[key] = parsed;
    }
  }

  return options;
}

async function requestJson(url, init) {
  const response = await fetch(url, init);
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = body?.error || response.statusText;
    throw new Error(`${init?.method || "GET"} ${url} returned ${response.status}: ${detail}`);
  }
  return body;
}

async function mapConcurrent(items, concurrency, callback) {
  let next = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next;
      next += 1;
      await callback(items[index], index);
    }
  });
  await Promise.all(workers);
}

function percentile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(fraction * sorted.length) - 1];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function run(options) {
  const runId = randomUUID();
  const startedAt = Date.now();
  const jobs = [];
  let submissionErrors = 0;

  console.log(`Submitting ${options.jobs} jobs to ${options.url}/jobs (run ${runId})`);
  await mapConcurrent(Array.from({ length: options.jobs }), options.concurrency, async (_, index) => {
    try {
      const acceptedAt = Date.now();
      const result = await requestJson(`${options.url}/jobs`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          payload: { benchmarkRun: runId, sequence: index + 1 },
        }),
      });
      if (!result?.jobId) throw new Error("POST /jobs response did not include jobId");
      jobs.push({ id: result.jobId, acceptedAt, status: result.status || "pending" });
    } catch (error) {
      submissionErrors += 1;
      console.error(`Submission ${index + 1} failed: ${error.message}`);
    }
  });

  const submittedAt = Date.now();
  console.log(`Accepted ${jobs.length}/${options.jobs} jobs in ${((submittedAt - startedAt) / 1000).toFixed(2)}s`);
  if (jobs.length === 0) throw new Error("No jobs were accepted; cannot measure queue completion");

  const pending = new Map(jobs.map((job) => [job.id, job]));
  const deadline = Date.now() + options.timeout;
  while (pending.size > 0 && Date.now() < deadline) {
    const batch = [...pending.values()];
    await mapConcurrent(batch, options.concurrency, async (job) => {
      try {
        const result = await requestJson(`${options.url}/jobs/${encodeURIComponent(job.id)}`);
        if (result.status === "completed" || result.status === "failed") {
          job.status = result.status;
          job.finishedAt = Date.now();
          pending.delete(job.id);
        }
      } catch (error) {
        job.pollError = error.message;
      }
    });
    if (pending.size > 0 && Date.now() < deadline) await sleep(options.pollInterval);
  }

  const endedAt = Date.now();
  const terminal = jobs.filter((job) => job.finishedAt);
  const durations = terminal.map((job) => job.finishedAt - job.acceptedAt);
  const completed = terminal.filter((job) => job.status === "completed").length;
  const failed = terminal.filter((job) => job.status === "failed").length;
  const timedOut = pending.size;
  const elapsedSeconds = (endedAt - startedAt) / 1000;
  const result = {
    runId,
    submitted: jobs.length,
    submissionErrors,
    completed,
    failed,
    timedOut,
    submissionSeconds: (submittedAt - startedAt) / 1000,
    totalSeconds: elapsedSeconds,
    throughputJobsPerSecond: terminal.length / elapsedSeconds,
    latencyMs: {
      p50: percentile(durations, 0.5),
      p95: percentile(durations, 0.95),
      p99: percentile(durations, 0.99),
    },
  };

  console.log("\nBenchmark results");
  console.log(JSON.stringify(result, null, 2));
  if (timedOut > 0) {
    console.error(`\nTimed out waiting for ${timedOut} job(s).`);
    process.exitCode = 1;
  }
  if (submissionErrors > 0) process.exitCode = 1;
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log(HELP);
      return;
    }
    await run(options);
  } catch (error) {
    console.error(`Benchmark failed: ${error.message}`);
    console.error("Run with --help for usage.");
    process.exitCode = 1;
  }
}

main();
