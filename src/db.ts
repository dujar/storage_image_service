import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  DataSource,
  DataSourceOptions,
  PrimaryColumn,
} from "typeorm";
import { defaultsDeep } from "lodash";
import "reflect-metadata";
@Entity({ name: "imageTracker" })
export class ImageTracker {
  @PrimaryColumn({ unique: true })
  id!: string;

  @Column()
  reference!: string;

  @Column()
  fileType!: string;
}

export const createDB = async (conf?: Partial<DataSourceOptions>) => {
  const defaultConfig: DataSourceOptions = {
    type: "postgres",
    host: "localhost",
    port: 5435,
    username: "postgres",
    password: "pass",
    database: "progimage",
    entities: [ImageTracker],
    synchronize: true,
    logging: false,
    dropSchema: false,
  };
  const source = new DataSource(defaultsDeep(conf || {}, defaultConfig));
  source.initialize();
  return source;
};
