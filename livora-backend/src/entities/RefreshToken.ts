import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn
} from "typeorm";
import { User } from "./User";

@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  token!: string;

  @ManyToOne(() => User, user => user.refreshTokens, {
    onDelete: "CASCADE"
  })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "timestamp" })
  expiresAt!: Date;

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}