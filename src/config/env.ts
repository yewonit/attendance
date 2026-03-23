/**
 * 환경 변수 설정 및 Zod 기반 검증
 * dotenv로 .env.secret 파일을 로드하고, Zod 스키마로 타입 안전하게 검증합니다.
 */
import { config } from 'dotenv';
import { z } from 'zod';

config({ path: '.env' });

const envSchema = z
  .object({
    NODE_ENV: z.enum(['local', 'development', 'production']).default('local'),
    PORT: z.coerce.number().default(3000),

    DB_HOST: z.string().optional(),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional(),

    LOCAL_DB_HOST: z.string().default('localhost'),
    LOCAL_DB_USER: z.string().default('root'),
    LOCAL_DB_PASSWORD: z.string().default(''),
    LOCAL_DB_NAME: z.string().default('attendance'),

    DEVELOPMENT_DB_HOST: z.string().optional(),
    DEVELOPMENT_DB_USER: z.string().optional(),
    DEVELOPMENT_DB_PASSWORD: z.string().optional(),
    DEVELOPMENT_DB_NAME: z.string().optional(),

    PRODUCTION_DB_HOST: z.string().optional(),
    PRODUCTION_DB_USER: z.string().optional(),
    PRODUCTION_DB_PASSWORD: z.string().optional(),
    PRODUCTION_DB_NAME: z.string().optional(),

    AUTH_SERVER_HOST: z.string().optional(),
    AUTH_SERVER_PORT: z.coerce.number().optional(),
  })
  .transform((raw) => {
    const envMap = {
      local: {
        host: raw.LOCAL_DB_HOST,
        user: raw.LOCAL_DB_USER,
        password: raw.LOCAL_DB_PASSWORD,
        name: raw.LOCAL_DB_NAME,
      },
      development: {
        host: raw.DEVELOPMENT_DB_HOST ?? raw.DB_HOST,
        user: raw.DEVELOPMENT_DB_USER ?? raw.DB_USER,
        password: raw.DEVELOPMENT_DB_PASSWORD ?? raw.DB_PASSWORD,
        name: raw.DEVELOPMENT_DB_NAME ?? raw.DB_NAME,
      },
      production: {
        host: raw.PRODUCTION_DB_HOST ?? raw.DB_HOST,
        user: raw.PRODUCTION_DB_USER ?? raw.DB_USER,
        password: raw.PRODUCTION_DB_PASSWORD ?? raw.DB_PASSWORD,
        name: raw.PRODUCTION_DB_NAME ?? raw.DB_NAME,
      },
    } as const;

    const db = envMap[raw.NODE_ENV];

    return {
      nodeEnv: raw.NODE_ENV,
      port: raw.PORT,
      db: {
        host: db.host ?? 'localhost',
        user: db.user ?? 'root',
        password: db.password ?? '',
        name: db.name ?? 'attendance',
      },
      authServer: {
        host: raw.AUTH_SERVER_HOST,
        port: raw.AUTH_SERVER_PORT,
      },
    };
  });

export type Env = z.output<typeof envSchema>;

/** 검증된 환경 변수 싱글턴 */
export const env = envSchema.parse(process.env);
