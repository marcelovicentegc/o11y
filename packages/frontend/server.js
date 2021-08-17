const express = require("express");
const favicon = require("express-favicon");
const path = require("path");
const promclient = require("prom-client");
const { Kafka } = require("kafkajs");
const { parseReqBody } = require("./utils");

const PORT = 9087;
const { register, collectDefaultMetrics, Gauge } = promclient;

collectDefaultMetrics({
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // These are the default buckets.
});

const gauges = {
  FCP: new Gauge({
    name: "myapp_frontend_fcp",
    help: "FCP",
    registers: [register],
  }),
  TTFB: new Gauge({
    name: "myapp_frontend_ttfb",
    help: "TTFB",
    registers: [register],
  }),
  CLS: new Gauge({
    name: "myapp_frontend_cls",
    help: "CLS",
    registers: [register],
  }),
  FID: new Gauge({
    name: "myapp_frontend_fid",
    help: "FID",
    registers: [register],
  }),
  LCP: new Gauge({
    name: "myapp_frontend_lcp",
    help: "LCP",
    registers: [register],
  }),
};

async function start() {
  console.info("Starting frontend server...");

  const kafka = new Kafka({
    clientId: "myapp_frontend_server",
    brokers: ["localhost:9092"],
  });

  const producer = kafka.producer();

  await producer.connect();

  const server = express();

  server.use(express.json());
  server.use(favicon(__dirname + "/build/favicon.ico"));
  server.use(express.static(__dirname));
  server.use(express.static(path.join(__dirname, "build")));

  server.get("/metrics", async (_, res) => {
    try {
      res.set("Content-Type", register.contentType);
      res.end(await register.metrics());
    } catch (err) {
      res.status(500).end(err);
    }
  });

  server.get("/*", function (_, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

  server.post("/frontend-metrics/kafka", async function (req, res) {
    const body = parseReqBody(req);

    try {
      await producer.send({
        topic: "frontend_metrics",
        messages: [body],
      });

      res.status(201);
      res.end();
    } catch (err) {
      console.error(err);
      res.status(500);
      res.end();
    }
  });

  server.post("/frontend-metrics/gauge", function (req, res) {
    const body = parseReqBody(req);

    const gauge = gauges[body.name];

    if (gauge) {
      gauge.set(Number(body.value));

      res.status(201);
      res.end();

      return;
    }

    res.status(404);
    res.end();
  });

  server.listen(PORT, () => {
    console.info(`Frontend server listening on http://localhost:${PORT}`);
  });
}

start();
