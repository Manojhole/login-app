# RabbitMQ Producer–Consumer Demo

A beginner-friendly Node.js demo: a producer publishes jobs to RabbitMQ and a consumer worker processes them sequentially with a simulated 60-second job duration.

## Architecture

```text
Browser -> Producer API -> RabbitMQ (demo.jobs queue) -> Consumer worker
   |             |                    |                       |
Producer UI   publish message     durable queue          wait 60s, process,
                         <--- consumer dashboard polls status ---
```

- **Producer** creates and publishes messages.
- **RabbitMQ** stores jobs until a consumer receives them.
- **Consumer** subscribes to the queue.
- **Worker** is the code in the consumer that performs the job.
- After successful processing, the consumer sends an **ACK**. If it exits before ACK, RabbitMQ can redeliver the unacknowledged message.

The demo has one consumer with `prefetch(1)`, so jobs are handled one at a time. The 60-second wait simulates work in the worker; it is not a RabbitMQ delayed-message feature.

## Run with Docker Compose

Requirements: Docker Engine/Desktop and Docker Compose v2.

```bash
docker compose up --build
```

Open:
- Producer dashboard: http://localhost:3000
- Consumer dashboard: http://localhost:3001
- RabbitMQ Management UI: http://localhost:15672 (demo username `demo`, password `demo_password_change_me`)

Publish several messages quickly and watch the consumer process them one by one. Its dashboard refreshes automatically and shows queued/processing/completed status and an approximate countdown.

Stop:

```bash
docker compose down
```

Remove RabbitMQ's persisted demo data too:

```bash
docker compose down -v
```

## Project layout

- `producer/`: Express API and producer dashboard.
- `consumer/`: Express status dashboard and RabbitMQ worker.
- `docker-compose.yml`: RabbitMQ, producer and consumer services.

## Important notes

This is a learning demo, not a production job platform. Job history is held in consumer memory and resets when that process restarts. RabbitMQ messages are durable/persistent and the consumer uses manual ACK with prefetch 1. For production, add durable job-state storage, authentication, TLS, managed secrets, retry limits and a dead-letter queue. Do not expose RabbitMQ Management UI publicly or reuse demo credentials.
