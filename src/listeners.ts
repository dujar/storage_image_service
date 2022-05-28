import { ImageTracker } from "./db";
import { EConvertTypeExtension, EMimeTypes, TKoa } from "./types";
import fs from "fs";
import path from "path";
// @ts-ignore
import pngToJpeg from "png-to-jpeg";
import { v4 as uuid } from "uuid";

const saveImage = async (
  reference: string,
  fileType: EMimeTypes,
  id: string,
  ctx: TKoa["context"]
) => {
  const imageTracker = new ImageTracker();
  imageTracker.id = id;
  imageTracker.reference = reference;
  imageTracker.fileType = fileType;
  await ctx.db.manager.getRepository(ImageTracker).save(imageTracker);
  console.log("saved new Image: ", { imageTracker });
};

export const setUpAppListeners = (app: TKoa) => {
  setupPngToJegConverter(app);
};
function setupPngToJegConverter(app: TKoa) {
  app.on(
    EConvertTypeExtension.png_to_jpeg,
    async (image: ImageTracker, filePath: string, ctx: TKoa["context"]) => {
      console.log("CONVERTGING: ", EConvertTypeExtension.png_to_jpeg);
      let file;
      if (fs.existsSync(filePath)) {
        file = fs.readFileSync(filePath);
      } else {
        console.log("file not found", image);
        return;
      }
      const id = uuid();
      await pngToJpeg({ quality: 90 })(file).then((output: any) =>
        fs.writeFileSync(
          path.resolve(__dirname, ctx.config.uploadsDir, id),
          output
        )
      );
      await saveImage(image.reference, EMimeTypes.jpeg, id, ctx);
    }
  );
}
