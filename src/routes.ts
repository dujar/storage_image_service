import Router from "@koa/router";
import { ImageTracker } from "./db";
import { IAppState, IAppContext, EMimeTypes, TKoa } from "./types";
import fs from "fs";
import body from "koa-body";
import path from "path";
import { v4 as uuid } from "uuid";
import { Next } from "koa";
import sharp from "sharp";

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
    saveImages
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

async function extractImageInfo(ctx: TKoa["context"], next: Next) {
  const { id } = ctx.params;

  const reference = id.split(".")[0];
  const type = id.split(".")[1];
  if (!type) {
    ctx.status = 404;
    return;
  }

  let image = await ctx.db.manager.findOne(ImageTracker, {
    where: { reference, fileType: type },
  });

  if (!image) {
    image = await ctx.db.manager.findOne(ImageTracker, {
      where: { reference },
    });
    if (!image) {
      console.log("no image");
      ctx.status = 404;
      return;
    }
  }
  ctx.state = { reference, typeNeeded: type, image };
  ctx.image = image;
  await next();
}
async function renderImageInfo(ctx: TKoa["context"], next: Next) {
  const filePath = path.resolve(
    ctx.config?.uploadsDir || "",
    ctx.image?.id || ""
  );
  if (
    ctx.image?.fileType == ctx.state.typeNeeded &&
    ctx.config?.uploadsDir &&
    fs.existsSync(filePath)
  ) {
    ctx.type = ctx.image?.fileType as string;
    ctx.body = fs.createReadStream(filePath);
  } else {
    const output = await convertImageAndRender(ctx);
    if (!output) {
      ctx.status = 404;
      return;
    }
    console.log("passed image output", output);

    ctx.body = output;
  }
}
async function convertImageAndRender(ctx: TKoa["context"]) {
  const filePath = path.resolve(
    __dirname,
    ctx.config.uploadsDir,
    ctx.image?.id || ""
  );
  if (!fs.existsSync(filePath)) {
    console.log("did not find it");
    ctx.status = 500;
    return;
  }
  if (EMimeTypes[ctx.state.typeNeeded as EMimeTypes]) {
    if (EMimeTypes[ctx.image?.fileType as EMimeTypes]) {
      const options: any = { quality: 100 };
      if (ctx.state.typeNeeded === EMimeTypes.jpeg) {
      }
      return sharp(filePath)
        [EMimeTypes[ctx.state.typeNeeded as EMimeTypes]](options)
        .toBuffer();
    }
  }
  return false;
}
