# promethest

promethest is an experiment with monitoring tools with the sole aim to learn.

## Requirements

Make sure you got Docker, Prometheus, Prometheus' Pushgateway docker image, Prometheus' Node exporter, Grafana, Kafka, Kafka's Prometheus Exporter, NodeJS and yarn installed on your machine.

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

The [frontend](./packages/frontend) package contains a React application, served by a Node server which contains an endpoint to receive data from the frontend metrics and push them to Prometheus using the Pushgateway.

You can visit the Pushgateways' console on `http://localhost:9091`.

#### Kafka

Creates a `frontend_metrics` topic, consumed by Kafka's server instance running on `http://localhost:9092`.

###### Kafka exporter

Runs on `http://localhost:9308`.

### Instrumented applications

#### Go application

Runs on `http://localhost:9089`.

#### NodeJS application

Runs on `http://localhost:9088`.

#### Frontend (React) application

React application runs on `http://localhost:3000` and is served by a Node server on `http://localhost:9087`.
