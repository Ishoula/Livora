import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddImageUrlToProperties1739023000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "properties",
      new TableColumn({
        name: "image_url",
        type: "text",
        isNullable: true
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("properties", "image_url");
  }
}
