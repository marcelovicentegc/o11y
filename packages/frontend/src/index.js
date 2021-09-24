import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportCoreWebVitals from "./reportCoreWebVitals";

const BASE_URL = "http://localhost:9087/frontend-metrics";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

function sendToPrometheus(metric) {
  const body = JSON.stringify(metric);
  const serverUrl = BASE_URL + "/core-web-vitals";

  fetch(serverUrl, {
    body,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function sendToKafka(metric) {
  const body = JSON.stringify(metric);
  const serverUrl = BASE_URL + "/kafka";

  fetch(serverUrl, {
    body,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function sendMetrics(metric) {
  sendToPrometheus(metric);
  sendToKafka(metric);
}

reportCoreWebVitals(sendMetrics);
