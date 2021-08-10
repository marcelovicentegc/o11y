package main

import (
	"fmt"
	"net/http"
	"runtime"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func recordMetrics() {
	go func() {
		for {
			opsProcessed.Inc()
			time.Sleep(2 * time.Second)
		}
	}()

	go func() {
		if err := prometheus.Register(prometheus.NewGaugeFunc(
			prometheus.GaugeOpts{
				Subsystem: "runtime",
				Name:      "myapp_goroutines_count",
				Help:      "Number of goroutines that currently exist.",
			},
			func() float64 { return float64(runtime.NumGoroutine()) },
		)); err == nil {
			fmt.Println("GaugeFunc 'goroutines_count' registered.")
		}
		// Note that the count of goroutines is a gauge (and not a counter) as
		// it can go up and down.
	}()
}

var (
	opsProcessed = promauto.NewCounter(prometheus.CounterOpts{
		Name: "myapp_go_processed_ops_total",
		Help: "The total number of processed events",
	})
)

func main() {
	recordMetrics()

	http.Handle("/metrics", promhttp.Handler())
	http.ListenAndServe(":2112", nil)

	fmt.Println("listening on port :2112")
}
