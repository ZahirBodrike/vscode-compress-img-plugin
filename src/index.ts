import * as fs from "fs-extra";
import * as vscode from "vscode";
import core from "./core";
import { ByteSize, RoundNum, isImgFile } from "./util/tool";

async function compressImg(imageUrl) {
  try {
    const file = await fs.readFile(`${imageUrl}`);
    const obj: any = await core.uploadImg(file);
    const data: any = await core.downloadImg(obj.output.url);
    const oldSize = obj.input.size;
    const newSize = obj.output.size;
    const ratio = RoundNum(1 - obj.output.ratio, 2, true);
    fs.writeFileSync(`${imageUrl}`, data, "binary");
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

const compressImgList = async (files: string[], filePath) => {
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
        `${filePath}/${beforeCompressImages[index]}`
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

export const disposable = vscode.commands.registerCommand(
  "ieg-vscode-plugin.compress",
  (e) => {
    const targetFilePath = e.path;
    fs.ensureDir(targetFilePath)
      .then(() => {
        fs.readdir(targetFilePath)
          .then((data) => {
            vscode.window.showInformationMessage(
              `Compressing... dir: ${targetFilePath}`
            );
            compressImgList(data, targetFilePath).then((result) => {
              if (result?.type === "success") {
                const msg = `Compressed [${
                  result?.imageUrl
                }] completed: Old Size ${ByteSize(
                  result?.oldSize
                )}, New Size ${ByteSize(result?.newSize)}, Optimization Ratio ${
                  result?.ratio
                }`;
                vscode.window.showInformationMessage(msg);
              } else {
                const msg = `Compressed [${result?.imageUrl}] failed: ${result?.err}`;
                vscode.window.showErrorMessage(msg);
              }
            });
          })
          .catch((err) => {
            vscode.window.showInformationMessage(
              `Compressed [${targetFilePath}] failed: ${err}`
            );
          });
      })
      .catch(() => {
        if (isImgFile(targetFilePath)) {
          vscode.window.showInformationMessage(
            `Compressing... dir: ${targetFilePath}`
          );
          compressImg(targetFilePath).then((result) => {
            if (result?.type === "success") {
              const msg = `Compressed [${
                result?.imageUrl
              }] completed: Old Size ${ByteSize(
                result?.oldSize
              )}, New Size ${ByteSize(result?.newSize)}, Optimization Ratio ${
                result?.ratio
              }`;
              vscode.window.showInformationMessage(msg);
            } else {
              const msg = `Compressed [${result?.imageUrl}] failed: ${result?.err}`;
              vscode.window.showErrorMessage(msg);
            }
          });
        } else {
          vscode.window.showErrorMessage("Sorry. This file is not a img file.");
        }
      });
  }
);
