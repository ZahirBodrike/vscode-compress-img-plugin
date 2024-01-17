import * as fs from "fs-extra";
import * as vscode from "vscode";
import core from "./core";
import { ByteSize, isImgFile } from "../util/tool";

export enum ECompressType {
  Cover,
  Create,
}

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

class ImageCompress {
  type: ECompressType;
  targetFilePath: string;

  constructor({ type, targetFilePath }) {
    this.type = type;
    this.targetFilePath = targetFilePath;
  }

  compressImage() {
    if (isImgFile(this.targetFilePath)) {
      vscode.window.showInformationMessage(
        `Compressing... dir: ${this.targetFilePath}`
      );
      core.compressImg(this.targetFilePath, this.type).then((result) => {
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
  }

  compressDirectory() {
    fs.readdir(this.targetFilePath)
      .then((data) => {
        vscode.window.showInformationMessage(
          `Compressing... dir: ${this.targetFilePath}`
        );
        core
          .compressImgList(data, this.targetFilePath, this.type)
          .then((result) => {
            messageShower({
              type: result?.type,
              imageUrl: result?.imageUrl,
              oldSize: result?.oldSize,
              newSize: result?.newSize,
              ratio: result?.ratio,
              err: result?.err,
            });
          });
      })
      .catch((err) => {
        vscode.window.showInformationMessage(
          `Compressed [${this.targetFilePath}] failed: ${err}`
        );
      });
  }

  run() {
    fs.ensureDir(this.targetFilePath)
      .then(() => {
        this.compressDirectory();
      })
      .catch(() => {
        // img
        this.compressImage();
      });
  }
}

export default ImageCompress;
