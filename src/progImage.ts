import Koa from "koa";
import { getRoutes } from "./routes";
import { createDB } from "./db";
import { DataSource } from "typeorm";
import { setUpAppListeners } from "./listeners";
import { IConfig, TKoa, TRouter } from "./types";
import { Server } from "http";

export class ProgImage {
  private app!: TKoa;
  private router!: TRouter;
  private port!: number;
  private server!: Server;

  constructor(private db: DataSource, private config: IConfig) {}
  static async create(config: IConfig) {
    const db = await createDB(config?.db);
    const service = new ProgImage(db, config);

    service.bootstrap(config);
    return service;
  }

  bootstrap(config: IConfig) {
    this.port = config.port || Number(process.env.PORT) || 5001;
    this.app = new Koa();
    this.router = getRoutes(config.uploadsDir);
    this.app.context.db = this.db;
    this.app.context.config = this.config;
    setUpAppListeners(this.app);
  }

  start = async () => {
    this.app.use(this.router.routes()).use(this.router.allowedMethods());
    this.server = this.app.listen(this.port, () => {
      console.log("listening to port", this.port);
    });
  };
  getDb = () => this.db;
  close = () => {
    this.server.unref();
    // this.server.on("close", () => {
    //   console.log("server close event");
    // });
    // this.server.close(() => {
    //   console.log("server closing callback");
    // });
  };
}
