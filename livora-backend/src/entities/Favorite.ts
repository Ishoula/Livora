import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique
} from "typeorm";
import { User } from "./User";
import { Property } from "./Property";

@Entity("favorites")
@Unique(["user", "property"])
export class Favorite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.favorites, {
    onDelete: "CASCADE"
  })
  user: User;

  @ManyToOne(() => Property, property => property.favorites, {
    onDelete: "CASCADE"
  })
  property: Property;

  @CreateDateColumn()
  createdAt: Date;
}
