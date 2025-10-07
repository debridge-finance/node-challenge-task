import { ComponentStatus, LivenessStatus, ReadinessStatus, HealthStatus } from "../enums";

export interface HealthCheckResult {
  name: string;
  status: ComponentStatus;
  responseTime?: number;
  error?: string;
}

export interface BaseHealthResponse {
  status: string;
  timestamp: string;
}

export interface LivenessResponse extends BaseHealthResponse {
  status: LivenessStatus.ALIVE;
  uptime: number;
}

export interface ReadinessResponse extends BaseHealthResponse {
  status: ReadinessStatus;
  checks: HealthCheckResult[];
}

export interface HealthResponse extends BaseHealthResponse {
  status: HealthStatus;
  uptime: number;
  checks: HealthCheckResult[];
  details: {
    database?: HealthCheckResult;
    redis?: HealthCheckResult;
    kafka?: HealthCheckResult;
    results?: HealthCheckResult[];
  };
}
