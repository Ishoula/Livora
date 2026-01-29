import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Property } from "../entities/Property";
import { PropertyImage } from "../entities/PropertyImage";
import { Favorite } from "../entities/Favorite";
import { Message } from "../entities/Message";
import { Notification } from "../entities/Notification";
import { RefreshToken } from "../entities/RefreshToken";
import { config } from "./env";

const { host, db_port, username, password, database } = config;

if (!host || !username || !password || !database) {
  throw new Error(
    "Database environment variables are missing! Please set DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME."
  );
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host,
  port: db_port,
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
    Notification,
    RefreshToken
  ]
});
