/**
 * Drizzle Kit 설정
 * 마이그레이션 생성 및 DB push에 사용됩니다.
 * NODE_ENV에 따라 env.ts에서 자동으로 DB 크레덴셜이 결정됩니다.
 */
import { defineConfig } from 'drizzle-kit';
import { env } from './src/config/env';

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: env.db.host,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
  },
});
