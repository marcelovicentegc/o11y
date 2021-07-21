# promethest

## Prometheus

Install `prometheus`

```bash
brew install prometheus
```

Execute it using the configuration file from this repo

```bash
prometheus --config.file=prometheus.yml
```

Navigate to `http://localhost:9000` and run the following PromQLs on the search console

```bash
promhttp_metric_handler_requests_total
promhttp_metric_handler_requests_total{code="200"}
count(promhttp_metric_handler_requests_total)
rate(promhttp_metric_handler_requests_total{code="200"}[1m])
```

## Node exporter

Install Prometheus' Node Exporter

```bash
brew install node_exporter
```

Start it

```bash
node_exporter
```

Navigate to `http://localhost:9000` and run the following PromQLs on the search console

```bash
rate(node_cpu_seconds_total{mode="system"}[1m])
node_filesystem_avail_bytes
rate(node_network_receive_bytes_total[1m])
```
