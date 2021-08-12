import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

function sendToPrometheus(metric) {
  const body = JSON.stringify(metric);
  const serverUrl = "http://localhost:9087/frontend-metrics";

  fetch(serverUrl, {
    body,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

reportWebVitals(sendToPrometheus);
