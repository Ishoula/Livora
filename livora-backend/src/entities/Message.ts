import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn
} from "typeorm";
import { User } from "./User";
import { Property } from "./Property";

@Entity("messages")
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  message: string;

  @ManyToOne(() => User, user => user.sentMessages, {
    onDelete: "CASCADE"
  })
  sender: User;

  @ManyToOne(() => User, user => user.receivedMessages, {
    onDelete: "CASCADE"
  })
  receiver: User;

  @ManyToOne(() => Property, property => property.messages, {
    onDelete: "CASCADE"
  })
  property: Property;

  @CreateDateColumn()
  sentAt: Date;
}
