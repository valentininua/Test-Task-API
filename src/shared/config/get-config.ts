export type AppConfig = {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  jwtIssuer: string;
  jwtAudience: string;
  seedOnStartup: boolean;
  seedUsersCount: number;
  seedBatchSize: number;
  outboxPollIntervalMs: number;
};

function envBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'y', 'on'].includes(value.toLowerCase());
}

function envInt(value: string | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export function getConfig(): AppConfig {
  return {
    port: envInt(process.env.PORT, 3000),
    mongoUri: process.env.MONGO_URI ?? 'mongodb://mongo:27017/test_task',
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    jwtIssuer: process.env.JWT_ISSUER ?? 'test-task-server',
    jwtAudience: process.env.JWT_AUDIENCE ?? 'test-task-clients',
    seedOnStartup: envBool(process.env.SEED_ON_STARTUP, true),
    seedUsersCount: envInt(process.env.SEED_USERS_COUNT, 2_000_000),
    seedBatchSize: envInt(process.env.SEED_BATCH_SIZE, 50_000),
    outboxPollIntervalMs: envInt(process.env.OUTBOX_POLL_INTERVAL_MS, 1000),
  };
}

