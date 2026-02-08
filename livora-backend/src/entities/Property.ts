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
  @PrimaryGeneratedColumn("increment")
  id!: number;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  price!: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  propertyType!: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  location!: string | null;

  @Column({ type: "int", nullable: true })
  bedrooms!: number | null;

  @Column({ type: "int", nullable: true })
  bathrooms!: number | null;

  @Column({type:"text", nullable:true})
  image_url!:string |null;
  
  @Column({
    type: "enum",
    enum: PropertyStatus,
    default: PropertyStatus.AVAILABLE
  })
  status!: PropertyStatus;

  @ManyToOne(() => User, user => user.properties, { onDelete: "CASCADE" })
  owner!: User;

  @OneToMany(() => PropertyImage, image => image.property)
  images!: PropertyImage[];

  @OneToMany(() => Favorite, favorite => favorite.property)
  favorites!: Favorite[];

  @OneToMany(() => Message, message => message.property)
  messages!: Message[];

  @CreateDateColumn({ type: "timestamp" })
  createdAt!: Date;
}
