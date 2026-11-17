const express = require("express");
const amqp = require("amqplib");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const AMQP_URL = process.env.AMQP_URL || "amqp://localhost";
const QUEUE = process.env.QUEUE_NAME || "demo.jobs";

app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));

let channel;
let connection;
let rabbitReady = false;

async function connectRabbitMQ() {
  while (!rabbitReady) {
    try {
      connection = await amqp.connect(AMQP_URL);
      connection.on("error", (err) => {
        rabbitReady = false;
        console.error("RabbitMQ connection error:", err.message);
      });
      connection.on("close", () => {
        rabbitReady = false;
        console.error("RabbitMQ connection closed; reconnecting...");
        setTimeout(connectRabbitMQ, 3000);
      });
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE, { durable: true });
      rabbitReady = true;
      console.log(`Connected to RabbitMQ; publishing to ${QUEUE}`);
    } catch (err) {
      console.error("RabbitMQ not ready:", err.message);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}

app.get("/api/health", (_req, res) => {
  res.status(rabbitReady ? 200 : 503).json({ status: rabbitReady ? "ok" : "waiting_for_rabbitmq" });
});

app.post("/api/messages", (req, res) => {
  if (!rabbitReady || !channel) {
    return res.status(503).json({ error: "Producer is not connected to RabbitMQ yet. Try again shortly." });
  }
  const message = String(req.body.message || "").trim();
  if (!message || message.length > 500) {
    return res.status(400).json({ error: "Enter a message between 1 and 500 characters." });
  }
  const job = { id: crypto.randomUUID(), message, createdAt: new Date().toISOString() };
  try {
    channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(job)), {
      persistent: true, contentType: "application/json", messageId: job.id, timestamp: Date.now()
    });
    res.status(202).json({ accepted: true, job });
  } catch (err) {
    console.error("Publish failed:", err);
    res.status(500).json({ error: "Could not publish message." });
  }
});

async function shutdown() {
  try { if (channel) await channel.close(); } catch (_) {}
  try { if (connection) await connection.close(); } catch (_) {}
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

app.listen(PORT, () => console.log(`Producer dashboard listening on ${PORT}`));
connectRabbitMQ();
