import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn
} from "typeorm";
import { User } from "./User";
import { PropertyImage } from "./PropertyImage";
import { Favorite } from "./Favorite";
import { Message } from "./Message";

export enum PropertyStatus {
  AVAILABLE = "available",
  SOLD = "sold",
  RENTED = "rented",
  INACTIVE = "inactive"
}

@Entity("properties")
export class Property {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column("text", { nullable: true })
  description: string;

  @Column("decimal", { precision: 12, scale: 2 })
  price: number;

  @Column({ nullable: true })
  propertyType: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  bedrooms: number;

  @Column({ nullable: true })
  bathrooms: number;

  @Column({
    type: "enum",
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE
  })
  status: PropertyStatus;

  @ManyToOne(() => User, user => user.properties, { onDelete: "CASCADE" })
  owner: User;

  @OneToMany(() => PropertyImage, image => image.property)
  images: PropertyImage[];

  @OneToMany(() => Favorite, favorite => favorite.property)
  favorites: Favorite[];

  @OneToMany(() => Message, message => message.property)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;
}
