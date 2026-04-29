import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';

// --- Schema Definition ---
export const reservations = pgTable('reservations', {
  id: text('id').primaryKey(),
  room_id: text('room_id').notNull(),
  reserver: text('reserver').notNull(),
  description: text('description').notNull(),
  start_time: timestamp('start_time', { withTimezone: true }).notNull(),
  end_time: timestamp('end_time', { withTimezone: true }).notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const rooms = pgTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  capacity: integer('capacity').notNull(),
  color: text('color').notNull(),
  header_bg: text('header_bg').notNull(),
  accent_bg: text('accent_bg').notNull(),
  border_color: text('border_color').notNull(),
  text_color: text('text_color').notNull(),
  order: integer('order').default(0),
});

export const customHolidays = pgTable('custom_holidays', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  name: text('name').notNull(),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type ReservationSchema = typeof reservations.$inferSelect;
export type RoomSchema = typeof rooms.$inferSelect;
export type CustomHolidaySchema = typeof customHolidays.$inferSelect;

// --- DB Client ---
let dbInstance: any = null;

export function getDb() {
  if (!dbInstance) {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error('Database connection string required.');
    }
    const sql = neon(connectionString);
    dbInstance = drizzle(sql, { schema: { reservations, rooms, customHolidays } });
  }
  return dbInstance;
}

export const db = new Proxy({} as any, {
  get(target, prop, receiver) {
    return Reflect.get(getDb(), prop, receiver);
  }
});
