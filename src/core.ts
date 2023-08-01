import * as Https from "https";
import * as Url from "url";
import { RandomNum } from "./util/tool";

const TINYIMG_URL = ["tinyjpg.com", "tinypng.com"];

function RandomHeader() {
  const ip = new Array(4)
    .fill(0)
    .map(() => parseInt(`${Math.random() * 255}`))
    .join(".");
  const index = RandomNum(0, 1);
  return {
    headers: {
      "Cache-Control": "no-cache",
      "Content-Type": "application/x-www-form-urlencoded",
      "Postman-Token": Date.now(),
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36",
      "X-Forwarded-For": ip,
    },
    hostname: TINYIMG_URL[index],
    method: "POST",
    path: "/backend/opt/shrink",
    rejectUnauthorized: false,
  };
}

function uploadImg(file) {
  const opts = RandomHeader();
  return new Promise((resolve, reject) => {
    const req = Https.request(opts, (res) =>
      res.on("data", (data) => {
        const obj = JSON.parse(data.toString());
        obj.error ? reject(obj.message) : resolve(obj);
      })
    );
    req.write(file, "binary");
    req.on("error", (e) => reject(e));
    req.end();
  });
}

function downloadImg(url) {
  const opts = new Url.URL(url);
  return new Promise((resolve, reject) => {
    const req = Https.request(opts, (res) => {
      let file = "";
      res.setEncoding("binary");
      res.on("data", (chunk) => (file += chunk));
      res.on("end", () => resolve(file));
    });
    req.on("error", (e) => reject(e));
    req.end();
  });
}

export default {
  uploadImg,
  downloadImg,
};
