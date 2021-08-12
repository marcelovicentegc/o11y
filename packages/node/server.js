"use strict";

const express = require("express");
const cluster = require("cluster");
const promclient = require("prom-client");

const server = express();
const { register, collectDefaultMetrics, Histogram, Counter, Gauge } =
  promclient;

// Enable collection of default metrics
collectDefaultMetrics({
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5], // These are the default buckets.
});

// Create custom metrics
const histogram = new Histogram({
  name: "myapp_node_histogram",
  help: "Example of a histogram",
  labelNames: ["code"],
});

const counter = new Counter({
  name: "myapp_node_counter",
  help: "Example of a counter",
  labelNames: ["code"],
});

new Counter({
  name: "myapp_node_scrape_counter",
  help: "Number of scrapes (example of a counter with a collect fn)",
  collect() {
    // collect is invoked each time `register.metrics()` is called.
    this.inc();
  },
});

const gauge = new Gauge({
  name: "myapp_node_gauge",
  help: "Example of a gauge",
  labelNames: ["method", "code"],
});

// Set metric values to some random values for demonstration
setTimeout(() => {
  histogram.labels("200").observe(Math.random());
  histogram.labels("300").observe(Math.random());
}, 10);

setInterval(() => {
  counter.inc({ code: 200 });
}, 5000);

setInterval(() => {
  counter.inc({ code: 400 });
}, 2000);

setInterval(() => {
  counter.inc();
}, 2000);

setInterval(() => {
  gauge.set({ method: "get", code: 200 }, Math.random());
  gauge.set(Math.random());
  gauge.labels("post", "300").inc();
}, 100);

if (cluster.isWorker) {
  // Expose some worker-specific metric as an example
  setInterval(() => {
    counter.inc({ code: `worker_${cluster.worker.id}` });
  }, 2000);
}

const timeIntervals = [];
setInterval(() => {
  for (let i = 0; i < 100; i++) {
    timeIntervals.push(new Date());
  }
}, 10);
setInterval(() => {
  while (timeIntervals.length > 0) {
    timeIntervals.pop();
  }
});

// Setup server to Prometheus scrapes:
server.get("/metrics", async (_, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end(err);
  }
});

server.get("/metrics/counter", async (_, res) => {
  try {
    res.set("Content-Type", register.contentType);
    res.end(await register.getSingleMetricAsString("test_counter"));
  } catch (err) {
    res.status(500).end(err);
  }
});

const port = 9088;
console.log(
  `Server listening to ${port}, metrics exposed on /metrics endpoint`
);
server.listen(port);
