import mysql, { Pool, RowDataPacket } from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var __publicApiDbPool: Pool | undefined;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getDbPool(): Pool {
  if (!global.__publicApiDbPool) {
    global.__publicApiDbPool = mysql.createPool({
      host: getRequiredEnv("DB_HOST"),
      port: Number(process.env.DB_PORT ?? "3306"),
      database: getRequiredEnv("DB_NAME"),
      user: getRequiredEnv("DB_USER"),
      password: process.env.DB_PASSWORD ?? "",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }

  return global.__publicApiDbPool;
}

export type DbRow = RowDataPacket;
