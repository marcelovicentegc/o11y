const express = require("express");
const favicon = require("express-favicon");
const path = require("path");
const prometheus = require("express-prom-bundle");
const promClient = require("prom-client");

const PORT = 9087;
const pushgateway = new promClient.Pushgateway("http://localhost:9091");

function start() {
  console.info("Starting frontend server...");

  // Creates the /metrics endpoint and exposes Node default metrics.
  const metricsMiddleware = prometheus({
    includeMethod: true,
    includePath: true,
    promClient: { collectDefaultMetrics: {} },
  });

  const app = express();

  app.use(express.json());
  app.use(favicon(__dirname + "/build/favicon.ico"));
  app.use(express.static(__dirname));
  app.use(express.static(path.join(__dirname, "build")));
  app.use(metricsMiddleware);

  app.get("/*", function (_, res) {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });

  app.post("/frontend-metrics", function (req, res) {
    const entries = req.body?.entries[0];
    delete req.body?.entries;
    const parsedBody = { ...req.body, entries };

    pushgateway.pushAdd(
      { jobName: req.body.name, groupings: parsedBody },
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
