import Router from "@koa/router";
import { ImageTracker } from "./db";
import {
  IAppState,
  IAppContext,
  EMimeTypes,
  TRouter,
  TKoa,
  EConvertTypeExtension,
} from "./types";
import fs from "fs";
import body from "koa-body";
import path from "path";
import { v4 as uuid } from "uuid";
import { Next } from "koa";

export const getRoutes = (uploadDir: string) => {
  const routes = new Router<IAppState, IAppContext>();
  routes.get("/test", (ctx) => {
    ctx.body = "test works";
  });

  routes.post(
    "/upload",
    body({
      formidable: { uploadDir },
      multipart: true,
      urlencoded: true,
    }),
    saveImages,
    convertImage
  );

  routes.get("/image/:id", extractImageInfo, renderImageInfo);

  return routes;
};
async function saveImages(ctx: TKoa["context"], next: Next) {
  const images = [];
  const resp = [];
  for (const k in ctx.request.files || {}) {
    const file: any = (ctx.request.files || {})[k];
    if (!file) {
      continue;
    }
    const type = file.mimetype;
    if (!type) {
      continue;
    }

    const imageTracker = new ImageTracker();
    imageTracker.id = file.newFilename;
    imageTracker.reference = uuid();
    imageTracker.fileType = type.split("/")[1];

    await ctx.db.manager.getRepository(ImageTracker).save(imageTracker);
    resp.push({
      id: imageTracker.reference,
      extensionType: imageTracker.fileType,
    });
    images.push(imageTracker);
  }
  ctx.images = images;
  ctx.body = resp;
  if (images.length > 0) {
    next();
  }
}
async function convertImage(ctx: TKoa["context"], next: Next) {
  for (const image of (ctx.images || []).values()) {
    const filePath = path.resolve(__dirname, ctx.config.uploadsDir, image.id);
    switch (image.fileType) {
      case EMimeTypes.png: {
        ctx.app.emit(EConvertTypeExtension.png_to_jpeg, image, filePath, ctx);
      }
      default:
    }
  }
}

async function renderImageInfo(ctx: TKoa["context"], next: Next) {
  const filePath = path.resolve(
    ctx.config?.uploadsDir || "",
    ctx.image?.id || ""
  );
  if (ctx.config?.uploadsDir && fs.existsSync(filePath)) {
    ctx.type = ctx.image?.fileType as string;
    ctx.body = fs.createReadStream(filePath);
  } else {
    ctx.status = 404;
  }
}

async function extractImageInfo(ctx: TKoa["context"], next: Next) {
  const { id } = ctx.params;

  const reference = id.split(".")[0];
  const type = id.split(".")[1];

  let image = await ctx.db.manager.findOne(ImageTracker, {
    where: { reference, fileType: type },
  });

  if (!image) {
    image = await ctx.db.manager.findOne(ImageTracker, {
      where: { reference },
    });
    if (image) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      image = await ctx.db.manager.findOne(ImageTracker, {
        where: { reference, fileType: type },
      });
      if (!image) {
        ctx.status = 404;
        return;
      }
    } else {
      ctx.status = 404;
      return;
    }
  }
  ctx.image = image;

  next();
}
