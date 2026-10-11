# AtomMQ - Redis-Backed Distributed Job Queue

A robust, distributed producer/consumer job queue built with Node.js, Express, and Redis.

---

## Architecture

- **Producer:** Express API that ingests work, stores job metadata, and pushes jobs to a pending queue.
- **Consumer:** Worker Node process that polls Redis for work and executes jobs.
- **Data Store:** Redis
    - **Job Metadata:** Hashes (`job:{jobId}`)
    - **Pending Queue:** List (`queue:pending`)
    - **Processing Queue:** List (`queue:processing`)

---

## Features

- **Atomic Queue Operations:** Uses Redis `MULTI/EXEC` and `BLMOVE` for safe, blocking queue pops.
- **Idempotency:** Ensures jobs are not processed multiple times.
- **Crash Recovery:** Active processing queue to prevent data loss if workers crash.
- **Dead-Letter Queue:** Exponential backoff and handling of failed jobs.

---

## Prerequisites

- Node.js (18+ recommended)
- Redis instance (local or remote)
- Git (optional)

You can run Redis locally via Docker:

```bash
docker run -p 6379:6379 redis:alpine
```

---

## Setup & Run

1. Clone and install dependencies:

```bash
git clone <repo-url>
cd rate-limiter-api
npm install
```

2. Create a `.env` in the root directory:

```env
REDIS_URL=redis://localhost:6379
PORT=3000   # optional
```

3. Start the server:

```bash
npm start
```

## Benchmark

Start Redis in Docker, then start the API and reaper in separate terminals:

```bash
npm run dev
npm run reaper
```

The benchmark command starts three workers by default, waits for them to connect to Redis, submits jobs through the HTTP API, and stops only the workers it launched when the run ends. Do not use `npm start` for this flow because it also starts workers.

```bash
npm run benchmark -- --jobs 100 --concurrency 10 --workers 3
```

The script submits jobs through the HTTP API, polls their status until they complete or fail, and reports submission time, overall throughput, terminal status counts, and p50/p95/p99 completion latency. Benchmark payloads include a run ID and remain in Redis for inspection. Failed jobs count as terminal; jobs still pending when the timeout expires are reported as timed out and cause a nonzero exit code.

Options:

```text
--url <url>                API base URL (default: http://localhost:$PORT, or port 3000)
--jobs <count>             Number of jobs to submit (default: 100)
--concurrency <count>      Concurrent submissions and status checks (default: 10)
--workers <count>          Worker processes to start (default: 3)
--poll-interval <ms>       Delay between status checks (default: 1000)
--timeout <ms>             Maximum completion wait (default: 600000)
--help                     Show usage
```

---

## License

MIT
