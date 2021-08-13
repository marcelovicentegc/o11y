const express = require("express");
const favicon = require("express-favicon");
const path = require("path");
const prometheus = require("express-prom-bundle");
const { Pushgateway } = require("prom-client");
const { Kafka } = require("kafkajs");
const { parseReqBody } = require("./utils");

const PORT = 9087;
const pushgateway = new Pushgateway("http://localhost:9091");

async function start() {
  console.info("Starting frontend server...");

  // Creates the /metrics endpoint and exposes Node default metrics.
  const metricsMiddleware = prometheus({
    includeMethod: true,
    includePath: true,
    promClient: { collectDefaultMetrics: {} },
  });

  const kafka = new Kafka({
    clientId: "myapp_frontend_server",
    brokers: ["localhost:9092"],
  });

  const producer = kafka.producer();

  await producer.connect();

  const app = express();

  app.use(express.json());
  app.use(favicon(__dirname + "/build/favicon.ico"));
  app.use(express.static(__dirname));
  app.use(express.static(path.join(__dirname, "build")));
  app.use(metricsMiddleware);

  app.get("/*", function (_, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

  app.post("/frontend-metrics/kafka", async function (req, res) {
    const body = parseReqBody(req);

    await producer.send({
      topic: "frontend_metrics",
      messages: [body],
    });

    res.status(201);
    res.end();
  });

  app.post("/frontend-metrics/pushgateway", function (req, res) {
    const body = parseReqBody(req);

    pushgateway.pushAdd(
      { jobName: req.body.name, groupings: body },
      function (err, resp) {
        if (err) {
          console.error(err);
          res.status(500);
          res.end();
        }

        if (resp) {
          console.log(resp);
        }
      }
    );

    res.status(201);
    res.end();
  });

  app.listen(PORT, () => {
    console.info(`Frontend server listening on http://localhost:${PORT}`);
  });
}

start();
