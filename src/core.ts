import * as Https from "https";
import * as Url from "url";
import * as Fs from "fs-extra";
import * as vscode from "vscode";

import { RandomNum, ByteSize, RoundNum, isImgFile } from "./util/tool";

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

function UploadImg(file) {
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

function DownloadImg(url) {
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

export async function CompressImg(imageUrl) {
  try {
    const file = await Fs.readFile(`${imageUrl}`);
    const obj: any = await UploadImg(file);
    const data: any = await DownloadImg(obj.output.url);
    const oldSize = ByteSize(obj.input.size);
    const newSize = ByteSize(obj.output.size);
    const ratio = RoundNum(1 - obj.output.ratio, 2, true);
    const msg = `Compressed [${imageUrl}] completed: Old Size ${oldSize}, New Size ${newSize}, Optimization Ratio ${ratio}`;
    Fs.writeFileSync(`${imageUrl}`, data, "binary");
    return Promise.resolve({ type: "success", msg });
  } catch (err) {
    const msg = `Compressed [${imageUrl}] failed: ${err}`;
    return Promise.resolve({ type: "fail", msg });
  }
}

export const compressImgList = async (files: string[], filePath) => {
  // 只过滤img
  const beforeCompressImages = files.filter((file) => isImgFile(file));
  if (!beforeCompressImages || beforeCompressImages.length <= 0) {
    vscode.window.showErrorMessage("Unprocessed image list is empty.");
    return;
  }
  for (let index = 0; index < beforeCompressImages.length; index++) {
    const { type, msg } = await CompressImg(
      `${filePath}/${beforeCompressImages[index]}`
    );
    console.log(msg);
    if (type === "fail") {
      vscode.window.showErrorMessage(msg);
    }
  }
};
