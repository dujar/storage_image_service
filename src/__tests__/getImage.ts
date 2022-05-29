import axios from "axios";
import { ProgImage } from "../progImage";
import fs from "fs";
import path from "path";
import FormData from "form-data";
import { ImageTracker } from "../db";
import sharp from "sharp";

const testPort = 4002;
const dir = path.resolve(__dirname, "../../testUploads");
let service: ProgImage;
describe("getImage", () => {
  beforeAll(async () => {
    fs.existsSync(dir) && fs.rmSync(dir, { recursive: true });
    !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true });

    service = await ProgImage.create({
      uploadsDir: dir,
      port: testPort,
      db: {
        database: "test",
        port: 5435,
        dropSchema: true,
      },
    });
    service.start();
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  afterAll(() => {
    service.close();
  });

  test("retrieving one image", async () => {
    const form = new FormData();
    form.append(
      "robot",
      fs.readFileSync(path.resolve(__dirname, "robot.png")),
      {
        filename: "robot.png",
      }
    );
    const data = form.getBuffer();
    const headers = form.getHeaders();

    const resp = await axios.post(`http://localhost:${testPort}/upload`, data, {
      headers,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const images = await service.getDb().manager.find(ImageTracker, {
      where: {
        reference: resp.data[0].id,
      },
    });
    {
      const imageRes = await axios.get(
        `http://localhost:${testPort}/image/${resp.data[0].id}.${resp.data[0].extensionType}`
      );

      expect(imageRes.data).toBeTruthy();
      const image = (await service.getDb().manager.findOne(ImageTracker, {
        where: {
          fileType: resp.data[0].extensionType,
          reference: resp.data[0].id,
        },
      })) || { id: "" };
      expect(fs.existsSync(path.resolve(dir, image.id))).toBeTruthy();
    }
  });

  test("retrieving jpeg from a stored png", async () => {
    const form = new FormData();
    form.append(
      "robot",
      fs.readFileSync(path.resolve(__dirname, "robot.png")),
      {
        filename: "robot.png",
      }
    );
    const data = form.getBuffer();
    const headers = form.getHeaders();

    const resp = await axios.post(`http://localhost:${testPort}/upload`, data, {
      headers,
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    const imageRes = await axios.get(
      `http://localhost:${testPort}/image/${resp.data[0].id}.jpeg`
    );
    expect(imageRes.data).toBeTruthy();
    const image = (await service.getDb().manager.findOne(ImageTracker, {
      where: {
        fileType: "jpeg",
        reference: resp.data[0].id,
      },
    })) || { id: "" };
    expect(image).toBeTruthy();
  });

  test("sharp conversion test from png to jpoeg", async () => {
    removeFile("pink.jpeg");
    sharp(fs.readFileSync(filePath("pink.png")))
      .jpeg({
        quality: 100,
      })
      .toBuffer()
      .then((data) => {
        fs.writeFileSync(filePath("pink.jpeg"), data);
      });
  });

  test("sharp conversion test from png to webp", async () => {
    removeFile("pink.webp");
    sharp(fs.readFileSync(filePath("pink.png")))
      .webp({ quality: 100 })
      .toBuffer()
      .then((data) => {
        fs.writeFileSync(filePath("pink.webp"), data);
      });
  });

  test("sharp conversion test from png to avif", async () => {
    removeFile("pink.avif");
    sharp(fs.readFileSync(filePath("pink.png")))
      .avif({ quality: 100 })
      .toBuffer()
      .then((data) => {
        fs.writeFileSync(filePath("pink.avif"), data);
      });
  });

  test("sharp conversion test from png to gif", async () => {
    removeFile("pink.gif");
    sharp(fs.readFileSync(filePath("pink.png")))
      .gif({})
      .toBuffer()
      .then((data) => {
        fs.writeFileSync(filePath("pink.gif"), data);
      });
  });

  test("sharp conversion test from png to tiff", async () => {
    removeFile("pink.tiff");
    sharp(fs.readFileSync(filePath("pink.png")))
      .tiff({ quality: 100 })
      .toBuffer()
      .then((data) => {
        fs.writeFileSync(filePath("pink.tiff"), data);
      });
  });
});

function filePath(name: string) {
  return path.resolve(__dirname, name);
}
function removeFile(f: string) {
  if (fs.existsSync(filePath(f))) {
    fs.rmSync(filePath(f));
  }
}
