import type { DataSource, DataSourceOptions } from "typeorm";
import type { ImageTracker } from "../db";
import type Koa from "koa";
import Router, { RouterContext } from "@koa/router";

export interface IConfig {
  uploadsDir: string;
  port?: number;
  db?: Partial<DataSourceOptions>;
}
export interface IAppContext extends RouterContext {
  db: DataSource;
  image?: ImageTracker;
  images?: ImageTracker[];
  config: IConfig;
}

export interface IAppState {}

export type TKoa = Koa<IAppState, IAppContext>;
export type TRouter = Router<IAppState, IAppContext>;

export enum EMimeTypes {
  jpeg = "jpeg",
  gif = "gif",
  png = "png",
}

export enum EConvertTypeExtension {
  png_to_jpeg = "png_to_jpeg",
}
