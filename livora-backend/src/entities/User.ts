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

  @Column({ length: 100 })
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column()
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
}
