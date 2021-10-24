# o11y 🧪

o11y is an experiment with monitoring tools with the sole aim to learn.

## Requirements

Make sure you're on a Mac and that you got Docker, Prometheus, Prometheus' Pushgateway docker image, Prometheus' Node exporter, Grafana, Kafka, Kafka's Prometheus Exporter, NodeJS and yarn installed on your machine.

You'll likely **not have** Prometheus, Prometheu's Pushgateway docker image and the Node exporter installed, so run this:

```bash
brew install prometheus grafana node_exporter
brew install java
brew install kafka
docker pull prom/pushgateway:latest
docker pull danielqsj/kafka-exporter:latest
```

## Running the experiment

```bash
yarn bootstrap # install the dependencies
yarn start     # start the experiment
```

### Grafana dashboards

Import these dashboards on Grafana after you've set Prometheus as a data source there. See [Grafana](#grafana) and [Prometheus](#prometheus) for more information on how to do this.

- [Kafka Exporter](grafana/kafka-exporter-overview_rev5.json)
- [Frontend Web Vitals](grafana/frontend-web-vitals-overview.json)

### Instrumented applications

- [Go application](./packages/go/README.md)
- [NodeJS application](./packages/node/README.md)
- [Frontend (React) application](./packages/frontend/README.md)

### Monitoring tools

#### Prometheus

Runs on `http://localhost:9090`.

Here are some queries you can run on the search console to test if Prometheus is monitoring itself:

```bash
promhttp_metric_handler_requests_total
promhttp_metric_handler_requests_total{code="200"}
count(promhttp_metric_handler_requests_total)
rate(promhttp_metric_handler_requests_total{code="200"}[1m])
```

##### Node exporter

Here are some example queries from Prometheus' Node exporter that you can run on the search console:

```bash
rate(node_cpu_seconds_total{mode="system"}[1m])
node_filesystem_avail_bytes
rate(node_network_receive_bytes_total[1m])
```

#### Grafana

By default, listens on `http://localhost:3000`, and the default login is `admin`/`admin`.

See https://prometheus.io/docs/visualization/grafana/#using for more information on setting Prometheus as a data source.

#### Prometheus Pushgateway

You can visit the Pushgateways' console on `http://localhost:9091`.

#### Kafka

Creates a `frontend_metrics` topic, consumed by Kafka's server instance running on `http://localhost:9092`.

###### Kafka exporter

Runs on `http://localhost:9308`.
