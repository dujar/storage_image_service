import axios from "axios";
import { ProgImage } from "../progImage";
import fs from "fs";
import path from "path";
import FormData from "form-data";

const testPort = 4001;
const dir = path.resolve(__dirname, "../../testUploads");
let service: ProgImage;
describe("upload", () => {
  beforeAll(async () => {
    service = await ProgImage.create({
      uploadsDir: dir,
      port: testPort,
      db: {
        database: "test",
        port: 5435,
        // dropSchema: true,
      },
    });
    service.start();
    await new Promise((resolve) => setTimeout(resolve, 2000));
  });

  afterAll(() => {
    service.close();
  });

  test("running test", async () => {
    await axios.get(`http://localhost:${testPort}/test`).then((res) => {
      expect(res.data).toBe("test works");
    });
  });

  test("uploading one image - gandalf", async () => {
    const form = new FormData();
    form.append(
      "soitsandalf",
      // fs.createReadStream(path.resolve(__dirname, "gandalf2.jpeg"))
      fs.readFileSync(path.resolve(__dirname, "gandalf2.jpeg")),
      { filename: "gandalf2.jpeg" }
    );

    const data = form.getBuffer();
    const headers = form.getHeaders();

    await axios
      .post(`http://localhost:${testPort}/upload`, data, { headers })
      .then((res) => {
        expect(res.data[0].id).toBeTruthy();
      });
  });

  test("uploading two images", async () => {
    const form = new FormData();
    form.append(
      "soitsandalf",
      // fs.createReadStream(path.resolve(__dirname, "gandalf2.jpeg"))
      fs.readFileSync(path.resolve(__dirname, "gandalf2.jpeg")),
      { filename: "gandalf2.jpeg" }
    );
    form.append(
      "robot",
      fs.readFileSync(path.resolve(__dirname, "robot.png")),
      {
        filename: "robot.png",
      }
    );

    const data = form.getBuffer();
    const headers = form.getHeaders();

    await axios
      .post(`http://localhost:${testPort}/upload`, data, { headers })
      .then((res) => {
        expect(res.data[0].id).toBeTruthy();
        expect(res.data[1].id).toBeTruthy();
      });
  });
});
