import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany
} from "typeorm";
import { Property } from "./Property";
import { Favorite } from "./Favorite";
import { Message } from "./Message";
import { Notification } from "./Notification";
import { RefreshToken } from "./RefreshToken";

export enum UserRole {
  BUYER = "buyer",
  SELLER = "seller",
  AGENT = "agent",
  ADMIN = "admin"
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  fullName: string;

  @Column({ type: "varchar", unique: true })
  email: string;

  @Column({ type: "varchar", length: 20, unique: true, nullable: true })
  phone: string;

  @Column({ type: "varchar", length: 255 })
  passwordHash: string;

  @Column({
    type: "enum",
    enum: UserRole
  })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  // Relationships
  @OneToMany(() => Property, property => property.owner)
  properties: Property[];

  @OneToMany(() => Favorite, favorite => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Message, message => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, message => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications: Notification[];

  @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
  refreshTokens: RefreshToken[];
}
