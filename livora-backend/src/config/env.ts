import dotenv from 'dotenv';

dotenv.config();

const dbPort = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

export const config = {
  port: Number(process.env.PORT) || 2727,
  jwt_key: process.env.JWT_SECRET,
  host: process.env.DB_HOST,
  db_port: dbPort,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};
