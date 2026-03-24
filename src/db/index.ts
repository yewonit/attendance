/**
 * Drizzle ORM 인스턴스 및 데이터베이스 연결 설정
 * MySQL2 커넥션 풀을 사용하여 Drizzle ORM 인스턴스를 생성합니다.
 */
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { env } from '../config/env';
import * as schema from './schema/index';

/** MySQL2 커넥션 풀 */
const pool = mysql.createPool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  timezone: '+09:00',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/** Drizzle ORM 인스턴스 (스키마 포함) */
export const db = drizzle(pool, {
  schema,
  mode: 'default',
});

/** 데이터베이스 연결 테스트 */
export async function testConnection(): Promise<void> {
  const connection = await pool.getConnection();
  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

export { pool };
