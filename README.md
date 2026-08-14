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

- Node.js (16+ recommended)
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

---

## License

MIT
