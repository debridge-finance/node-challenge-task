export interface HttpConfigOptions {
  cors: {
    origins: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
}

export const httpConfig = (): { http: HttpConfigOptions } => ({
  http: {
    cors: {
      origins: process.env["CORS_ORIGIN"]?.split(",") || [
        "http://localhost:3000",
        "http://localhost:3001",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
    rateLimit: {
      windowMs: Number(process.env["RATE_LIMIT_WINDOW_MS"]) || 900000, // 15 минут
      max: Number(process.env["RATE_LIMIT_MAX_REQUESTS"]) || 100,
    },
  },
});
