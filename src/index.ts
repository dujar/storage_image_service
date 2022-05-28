import { ProgImage } from "./progImage";
import path from "path";
ProgImage.create({
  uploadsDir: path.resolve(__dirname, "../uploads"),
  db: {
    // dropSchema: true,
  },
}).then((progimage) => progimage.start());
