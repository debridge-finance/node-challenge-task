export interface IHealthCheck {
  check(): Promise<HealthCheckResult>;
}

export interface HealthCheckResult {
  status: "ok" | "error";
  message: string;
  timestamp?: Date;
  details?: Record<string, unknown>;
}

export interface IDatabaseHealthCheck extends IHealthCheck {
  checkConnection(): Promise<HealthCheckResult>;
}

export interface IRedisHealthCheck extends IHealthCheck {
  checkConnection(): Promise<HealthCheckResult>;
}

export interface IKafkaHealthCheck extends IHealthCheck {
  checkConnection(): Promise<HealthCheckResult>;
}
