import * as Https from "https";
import * as Url from "url";
import * as fs from "fs-extra";
import * as vscode from "vscode";
import { RandomNum, RoundNum, isImgFile } from "../util/tool";
import { ECompressType } from "./base";

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

async function compressImg(imageUrl: string, type: ECompressType) {
  try {
    const file = await fs.readFile(`${imageUrl}`);
    const obj: any = await uploadImg(file);
    const data: any = await downloadImg(obj.output.url);
    const oldSize = obj.input.size;
    const newSize = obj.output.size;
    const ratio = RoundNum(1 - obj.output.ratio, 2, true);
    if (type === ECompressType.Cover) {
      fs.writeFileSync(`${imageUrl}`, data, "binary");
    } else if (type === ECompressType.Create) {
      const now = Date.now();
      const oldImgName = imageUrl.replace(".", `_old_${now}.`);
      fs.rename(imageUrl, oldImgName).then(() => {
        fs.writeFileSync(`${imageUrl}`, data, "binary");
      });
    }

    return {
      type: "success",
      imageUrl,
      oldSize,
      newSize,
      ratio,
      err: undefined,
    };
  } catch (err) {
    return { type: "fail", imageUrl, oldSize: 0, newSize: 0, ratio: 0, err };
  }
}

const compressImgList = async (
  files: string[],
  filePath,
  compressType: ECompressType
) => {
  // 只过滤img
  try {
    const beforeCompressImages = files.filter((file) => isImgFile(file));
    if (!beforeCompressImages || beforeCompressImages.length <= 0) {
      vscode.window.showErrorMessage("Unprocessed image list is empty.");
      return;
    }
    let totalOldSize = 0;
    let totalNewSize = 0;
    for (let index = 0; index < beforeCompressImages.length; index++) {
      const { type, oldSize, newSize } = await compressImg(
        `${filePath}/${beforeCompressImages[index]}`,
        compressType
      );
      if (type === "success") {
        totalOldSize += oldSize;
        totalNewSize += newSize;
      }
    }
    return {
      type: "success",
      imageUrl: filePath,
      oldSize: totalOldSize,
      newSize: totalNewSize,
      ratio: RoundNum(1 - totalNewSize / totalOldSize, 2, true),
      err: undefined,
    };
  } catch (err) {
    return {
      type: "fail",
      imageUrl: filePath,
      oldSize: 0,
      newSize: 0,
      ratio: 0,
      err,
    };
  }
};

export default {
  compressImg,
  compressImgList,
};
