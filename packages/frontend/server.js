const express = require("express");
const favicon = require("express-favicon");
const path = require("path");
const promclient = require("prom-client");
const { Kafka } = require("kafkajs");
const { parseReqBody } = require("./utils");

const PORT = 9087;
const { register, collectDefaultMetrics, Histogram } = promclient;

collectDefaultMetrics({
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // These are the default buckets.
});

const coreWebVitalsInstruments = {
  CLS: new Histogram({
    help: "The Cumulative Layout Shift (CLS) is a measure of the largest burst of layout shift scores for every unexpected layout shift that occurs during the entire lifespan of a page.",
    name: "myapp_frontend_cls",
    registers: [register],
    buckets: [0.1, 0.25],
  }),
  FID: new Histogram({
    help: "The First Input Delay (FID) measures the time from a user first interacts with a page (i.e. when they click a link, tap on a button, or use a custom, JavaScript-powered control) to the time when the browser is actually able to begin processing event handlers in response to that interaction.",
    name: "myapp_frontend_fid",
    registers: [register],
    buckets: [100, 300],
  }),
  LCP: new Histogram({
    help: "The Largest Contentful Paint (LCP) metric reports the render time of the largest image or text block visible within the viewport, relative to when the page first started loading.",
    name: "myapp_frontend_lcp",
    registers: [register],
    buckets: [2500, 4000],
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

  server.post("/frontend-metrics/core-web-vitals", function (req, res) {
    const body = parseReqBody(req);

    const coreWebVital = coreWebVitalsInstruments[body.name];

    if (coreWebVital) {
      coreWebVital.observe(Number(body.value));

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
