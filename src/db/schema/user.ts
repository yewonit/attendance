/** 사용자 테이블 스키마 */
import { relations } from 'drizzle-orm';
import {
  boolean,
  char,
  date,
  int,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/mysql-core';
import { attendances } from './attendance';
import { userAttendanceAggregates } from './user-attendance-aggregate';
import { userRoles } from './user-role';

export const users = mysqlTable('user', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull(),
  /** 동명이인 구분자 (e.g. 이장훈A의 A) */
  nameSuffix: varchar('name_suffix', { length: 10 }).notNull(),
  email: varchar('email', { length: 50 }),
  password: text('password'),
  gender: char('gender', { length: 1 }),
  birthDate: date('birth_date'),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  isNewMember: boolean('is_new_member').notNull().default(false),
  isLongTermAbsentee: boolean('is_long_term_absentee').notNull().default(false),
  isDeleted: boolean('is_deleted').notNull().default(false),
  registrationDate: timestamp('registration_date').defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  attendances: many(attendances),
  attendanceAggregates: many(userAttendanceAggregates),
  userRoles: many(userRoles),
}));
