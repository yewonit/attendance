/**
 * 환경 변수 설정 및 Zod 기반 검증
 * dotenv로 .env 파일을 로드하고, Zod 스키마로 타입 안전하게 검증합니다.
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

    // 인증 — JWT 서명 키는 환경별로 분리해 dev 토큰이 운영에서 통하지 않게 한다
    LOCAL_JWT_SECRET: z.string().optional(),
    DEVELOPMENT_JWT_SECRET: z.string().optional(),
    PRODUCTION_JWT_SECRET: z.string().optional(),

    REDIS_HOST: z.string().optional(),
    REDIS_PORT: z.coerce.number().default(6379),
    LOCAL_REDIS_HOST: z.string().default('localhost'),

    // 인증 코드 메일 발송 계정 (Gmail 앱 비밀번호)
    SENDER_EMAIL: z.string().optional(),
    SENDER_SECRET: z.string().optional(),
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

    const jwtSecretMap = {
      local: raw.LOCAL_JWT_SECRET,
      development: raw.DEVELOPMENT_JWT_SECRET,
      production: raw.PRODUCTION_JWT_SECRET,
    } as const;

    return {
      nodeEnv: raw.NODE_ENV,
      port: raw.PORT,
      db: {
        host: db.host ?? 'localhost',
        user: db.user ?? 'root',
        password: db.password ?? '',
        name: db.name ?? 'attendance',
      },
      auth: {
        jwtSecret: jwtSecretMap[raw.NODE_ENV],
      },
      redis: {
        host: raw.NODE_ENV === 'local' ? raw.LOCAL_REDIS_HOST : (raw.REDIS_HOST ?? 'localhost'),
        port: raw.REDIS_PORT,
      },
      mail: {
        sender: raw.SENDER_EMAIL,
        secret: raw.SENDER_SECRET,
      },
    };
  });

export type Env = z.output<typeof envSchema>;

/** 검증된 환경 변수 싱글턴 */
export const env = envSchema.parse(process.env);
