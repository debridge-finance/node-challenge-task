export enum CompressionType {
  NONE = "none",
  GZIP = "gzip",
  LZ4 = "lz4",
  SNAPPY = "snappy",
  ZSTD = "zstd",
}

export enum KafkaLogLevel {
  ERROR = "error",
  WARN = "warn",
  INFO = "info",
  DEBUG = "debug",
  NOTHING = "nothing",
}

export enum RetryStrategy {
  FIXED = "fixed",
  EXPONENTIAL = "exponential",
  LINEAR = "linear",
  CUSTOM = "custom",
}

export enum MetricsType {
  COUNTER = "counter",
  GAUGE = "gauge",
  HISTOGRAM = "histogram",
  SUMMARY = "summary",
  CUSTOM = "custom",
}
