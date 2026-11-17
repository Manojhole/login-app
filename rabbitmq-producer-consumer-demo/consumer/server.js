const express = require("express");
const amqp = require("amqplib");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3001);
const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";
const QUEUE = process.env.QUEUE_NAME || "demo.jobs";
const PROCESSING_DELAY_MS = Math.max(1000, Number(process.env.PROCESSING_DELAY_MS || 60000));
const jobs = [];
const MAX_JOBS = 100;

let channel;
let connection;
let rabbitReady = false;
let activeJobId = null;

function record(job, status, extra = {}) {
  const item = { ...job, status, updatedAt: new Date().toISOString(), ...extra };
  const index = jobs.findIndex((entry) => entry.id === job.id);
  if (index >= 0) jobs[index] = item;
  else jobs.unshift(item);
  if (jobs.length > MAX_JOBS) jobs.length = MAX_JOBS;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startConsumer() {
  while (!rabbitReady) {
    try {
      connection = await amqp.connect(AMQP_URL);
      connection.on("error", (err) => {
        rabbitReady = false;
        console.error("RabbitMQ connection error:", err.message);
      });
      connection.on("close", () => {
        rabbitReady = false;
        channel = null;
        console.error("RabbitMQ connection closed; reconnecting...");
        setTimeout(startConsumer, 3000);
      });
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE, { durable: true });
      await channel.prefetch(1);
      rabbitReady = true;
      console.log(`Consumer listening on ${QUEUE}; prefetch=1`);

      await channel.consume(QUEUE, async (msg) => {
        if (!msg) return;
        let job;
        try {
          job = JSON.parse(msg.content.toString());
        } catch (err) {
          console.error("Invalid message; rejecting without requeue:", err.message);
          channel.nack(msg, false, false);
          return;
        }
        activeJobId = job.id;
        record(job, "processing", { startedAt: new Date().toISOString(), durationMs: PROCESSING_DELAY_MS });
        console.log(`Processing ${job.id}: ${job.message}`);
        try {
          await sleep(PROCESSING_DELAY_MS);
          record(job, "completed", { completedAt: new Date().toISOString() });
          channel.ack(msg);
          console.log(`Completed and ACKed ${job.id}`);
        } catch (err) {
          record(job, "failed", { error: err.message });
          channel.nack(msg, false, true);
          console.error("Job failed; requeued:", err.message);
        } finally {
          if (activeJobId === job.id) activeJobId = null;
        }
      }, { noAck: false });
    } catch (err) {
      rabbitReady = false;
      console.error("RabbitMQ not ready:", err.message);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

app.use(express.static(path.join(__dirname, "public")));
app.get("/api/health", (_req, res) => res.status(rabbitReady ? 200 : 503).json({
  status: rabbitReady ? "ok" : "waiting_for_rabbitmq", activeJobId, processingDelayMs: PROCESSING_DELAY_MS
}));
app.get("/api/jobs", (_req, res) => res.json({ jobs, activeJobId, processingDelayMs: PROCESSING_DELAY_MS }));

async function shutdown() {
  try { if (channel) await channel.close(); } catch (_) {}
  try { if (connection) await connection.close(); } catch (_) {}
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

app.listen(PORT, () => console.log(`Consumer dashboard listening on ${PORT}`));
startConsumer();
