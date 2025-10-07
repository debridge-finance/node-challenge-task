/**
 * Enums для health check статусов
 */

/**
 * Статус отдельного компонента
 */
export enum ComponentStatus {
  UP = "up",
  DOWN = "down",
}

/**
 * Статус liveness probe
 */
export enum LivenessStatus {
  ALIVE = "alive",
}

/**
 * Статус readiness probe
 */
export enum ReadinessStatus {
  READY = "ready",
  NOT_READY = "not_ready",
}

export enum HealthStatus {
  HEALTHY = "healthy",
  UNHEALTHY = "unhealthy",
}

export enum CheckStatus {
  OK = "ok",
  ERROR = "error",
}
