import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Property } from "./Property";

@Entity("property_images")
export class PropertyImage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  imageUrl: string;

  @ManyToOne(() => Property, property => property.images, {
    onDelete: "CASCADE"
  })
  property: Property;
}
