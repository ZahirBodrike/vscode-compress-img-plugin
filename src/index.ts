import * as fs from "fs-extra";
import * as vscode from "vscode";
import core from "./core";
import { ByteSize, RoundNum, isImgFile } from "./util/tool";

enum ECompressType {
  Cover,
  Create,
}

async function compressImg(imageUrl: string, type: ECompressType) {
  try {
    const file = await fs.readFile(`${imageUrl}`);
    const obj: any = await core.uploadImg(file);
    const data: any = await core.downloadImg(obj.output.url);
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

const messageShower = ({ type, imageUrl, oldSize, newSize, ratio, err }) => {
  if (type === "success") {
    const msg = `Compressed [${imageUrl}] completed: Old Size ${ByteSize(
      oldSize
    )}, New Size ${ByteSize(newSize)}, Optimization Ratio ${ratio}`;
    vscode.window.showInformationMessage(msg);
  } else {
    const msg = `Compressed [${imageUrl}] failed: ${err}`;
    vscode.window.showErrorMessage(msg);
  }
};

export const compressAndCoverDisposable = vscode.commands.registerCommand(
  "ieg-vscode-compress-plugin.compressAndCover",
  (e) => {
    const targetFilePath = e.path;
    fs.ensureDir(targetFilePath)
      .then(() => {
        fs.readdir(targetFilePath)
          .then((data) => {
            vscode.window.showInformationMessage(
              `Compressing... dir: ${targetFilePath}`
            );
            compressImgList(data, targetFilePath, ECompressType.Cover).then(
              (result) => {
                messageShower({
                  type: result?.type,
                  imageUrl: result?.imageUrl,
                  oldSize: result?.oldSize,
                  newSize: result?.newSize,
                  ratio: result?.ratio,
                  err: result?.err,
                });
              }
            );
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
          compressImg(targetFilePath, ECompressType.Cover).then((result) => {
            messageShower({
              type: result?.type,
              imageUrl: result?.imageUrl,
              oldSize: result?.oldSize,
              newSize: result?.newSize,
              ratio: result?.ratio,
              err: result?.err,
            });
          });
        } else {
          vscode.window.showErrorMessage("Sorry. This file is not a img file.");
        }
      });
  }
);

export const compressAndCreateDisposable = vscode.commands.registerCommand(
  "ieg-vscode-compress-plugin.compressAndCreate",
  (e) => {
    const targetFilePath = e.path;
    fs.ensureDir(targetFilePath)
      .then(() => {
        fs.readdir(targetFilePath)
          .then((data) => {
            vscode.window.showInformationMessage(
              `Compressing... dir: ${targetFilePath}`
            );
            compressImgList(data, targetFilePath, ECompressType.Create).then(
              (result) => {
                messageShower({
                  type: result?.type,
                  imageUrl: result?.imageUrl,
                  oldSize: result?.oldSize,
                  newSize: result?.newSize,
                  ratio: result?.ratio,
                  err: result?.err,
                });
              }
            );
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
          compressImg(targetFilePath, ECompressType.Create).then((result) => {
            messageShower({
              type: result?.type,
              imageUrl: result?.imageUrl,
              oldSize: result?.oldSize,
              newSize: result?.newSize,
              ratio: result?.ratio,
              err: result?.err,
            });
          });
        } else {
          vscode.window.showErrorMessage("Sorry. This file is not a img file.");
        }
      });
  }
);
