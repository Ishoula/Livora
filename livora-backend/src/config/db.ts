import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Property } from "../entities/Property";
import { PropertyImage } from "../entities/PropertyImage";
import { Favorite } from "../entities/Favorite";
import { Message } from "../entities/Message";
import { Notification } from "../entities/Notification";

const host = process.env.DB_HOST;
const username = process.env.DB_USER;
const password = process.env.DB_PASS;
const database = process.env.DB_NAME;

if (!host || !username || !password || !database) {
  throw new Error("Database environment variables are missing!");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host,
  port: 5432,
  username,
  password,
  database,
  synchronize: true,
  logging: false,
  entities: [
    User,
    Property,
    PropertyImage,
    Favorite,
    Message,
    Notification
  ]
});
