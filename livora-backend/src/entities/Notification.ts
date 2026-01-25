import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn
} from "typeorm";
import { User } from "./User";

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, user => user.notifications, {
    onDelete: "CASCADE"
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
