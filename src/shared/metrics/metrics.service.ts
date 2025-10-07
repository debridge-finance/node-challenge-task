import { Injectable } from "@nestjs/common";
import { register, Counter, Histogram, Gauge } from "prom-client";
import { IMetricsService } from "../interfaces/metrics-service.interface";

@Injectable()
export class MetricsService implements IMetricsService {
  // Price update metrics
  private readonly priceUpdatesCounter = new Counter({
    name: "price_updates_total",
    help: "Total number of price updates",
    labelNames: ["status"],
  });

  private readonly priceUpdateDuration = new Histogram({
    name: "price_update_duration_seconds",
    help: "Duration of price update operations",
    buckets: [0.1, 0.5, 1, 2, 5, 10],
  });

  private readonly priceUpdateErrors = new Counter({
    name: "price_update_errors_total",
    help: "Total number of price update errors",
  });

  // Kafka metrics
  private readonly kafkaMessagesSent = new Counter({
    name: "kafka_messages_sent_total",
    help: "Total number of Kafka messages sent",
    labelNames: ["topic"],
  });

  private readonly kafkaMessageDuration = new Histogram({
    name: "kafka_message_duration_seconds",
    help: "Duration of Kafka message operations",
    buckets: [0.01, 0.05, 0.1, 0.5, 1, 2],
  });

  private readonly kafkaMessageErrors = new Counter({
    name: "kafka_message_errors_total",
    help: "Total number of Kafka message errors",
  });

  // Distributed lock metrics
  private readonly distributedLocksAcquired = new Counter({
    name: "distributed_locks_acquired_total",
    help: "Total number of distributed locks acquired",
    labelNames: ["lock_name"],
  });

  private readonly distributedLocksReleased = new Counter({
    name: "distributed_locks_released_total",
    help: "Total number of distributed locks released",
    labelNames: ["lock_name"],
  });

  private readonly distributedLockFailures = new Counter({
    name: "distributed_lock_failures_total",
    help: "Total number of distributed lock failures",
    labelNames: ["lock_name", "reason"],
  });

  // System metrics
  private readonly activeConnections = new Gauge({
    name: "active_connections",
    help: "Number of active connections",
  });

  constructor() {
    // Register all metrics
    register.registerMetric(this.priceUpdatesCounter);
    register.registerMetric(this.priceUpdateDuration);
    register.registerMetric(this.priceUpdateErrors);
    register.registerMetric(this.kafkaMessagesSent);
    register.registerMetric(this.kafkaMessageDuration);
    register.registerMetric(this.kafkaMessageErrors);
    register.registerMetric(this.distributedLocksAcquired);
    register.registerMetric(this.distributedLocksReleased);
    register.registerMetric(this.distributedLockFailures);
    register.registerMetric(this.activeConnections);
  }

  // Price update metrics
  incrementPriceUpdates(): void {
    this.priceUpdatesCounter.inc({ status: "success" });
  }

  recordPriceUpdateDuration(durationMs: number): void {
    this.priceUpdateDuration.observe(durationMs / 1000);
  }

  incrementPriceUpdateErrors(): void {
    this.priceUpdateErrors.inc();
  }

  recordTokensProcessed(count: number): void {
    this.priceUpdatesCounter.inc({ status: "processed" }, count);
  }

  recordTokensUpdated(count: number): void {
    this.priceUpdatesCounter.inc({ status: "updated" }, count);
  }

  // Kafka metrics
  incrementKafkaMessagesSent(topic?: string): void {
    this.kafkaMessagesSent.inc({ topic: topic || "unknown" });
  }

  recordKafkaMessageDuration(durationMs: number): void {
    this.kafkaMessageDuration.observe(durationMs / 1000);
  }

  incrementKafkaMessageErrors(): void {
    this.kafkaMessageErrors.inc();
  }

  // Distributed lock metrics
  incrementDistributedLocksAcquired(lockName: string): void {
    this.distributedLocksAcquired.inc({ lock_name: lockName });
  }

  incrementDistributedLocksReleased(lockName: string): void {
    this.distributedLocksReleased.inc({ lock_name: lockName });
  }

  incrementDistributedLockFailures(lockName: string, reason: string): void {
    this.distributedLockFailures.inc({ lock_name: lockName, reason });
  }

  // System metrics
  setActiveConnections(count: number): void {
    this.activeConnections.set(count);
  }

  // Get all metrics as string
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  // Get metrics as JSON
  async getMetricsAsJSON(): Promise<unknown> {
    return register.getMetricsAsJSON();
  }
}
