import { registerAs } from "@nestjs/config";

export interface MonitoringConfigOptions {
  prometheusUrl: string;
  grafanaUrl: string;
  grafanaUser: string;
  grafanaPassword: string;
  metricsEnabled: boolean;
}

export const monitoringConfig = registerAs(
  "monitoring",
  (): MonitoringConfigOptions => ({
    prometheusUrl: process.env["PROMETHEUS_URL"] || "http://localhost:9090",
    grafanaUrl: process.env["GRAFANA_URL"] || "http://localhost:3001",
    grafanaUser: process.env["GRAFANA_USER"] || "admin",
    grafanaPassword: process.env["GRAFANA_PASSWORD"] || "admin",
    metricsEnabled: process.env["METRICS_ENABLED"] !== "false",
  })
);
