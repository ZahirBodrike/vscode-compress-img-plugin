import * as vscode from "vscode";
import { isImgFile } from "../util/tool";
import * as fs from "fs-extra";
import request from "../util/request";
import { uploadImg } from "./core";

class ImageUploader {
  targetFilePath: string;

  constructor({ targetFilePath }) {
    this.targetFilePath = targetFilePath;
  }

  uploadImage() {
    if (isImgFile(this.targetFilePath)) {
      const fileData = fs.readFileSync(this.targetFilePath);
      const blob = new Blob([fileData]);
      uploadImg(blob)
        .then((res) => {
          if (res.status === 200 && res.data.code === 200) {
            vscode.workspace
              .openTextDocument({
                language: "javascript",
                content: res.data.data.url,
              })
              .then((doc) => {
                vscode.window.showTextDocument(doc);
              });
          }
        })
        .catch((err) => {
          vscode.window.showErrorMessage("上传失败，请重试");
        });
    } else {
      vscode.window.showErrorMessage("Sorry. This file is not a img file.");
    }
  }

  uploadDirectory() {
    fs.readdir(this.targetFilePath)
      .then((data) => {
        const beforeUploadImages = data.filter((file) => isImgFile(file));
        if (!beforeUploadImages || beforeUploadImages.length <= 0) {
          vscode.window.showErrorMessage("该目录下没有图片资源");
          return;
        }
        const reqList: any[] = [];
        for (let index = 0; index < beforeUploadImages.length; index++) {
          const fileData = fs.readFileSync(
            `${this.targetFilePath}/${beforeUploadImages[index]}`
          );
          const blob = new Blob([fileData]);
          reqList.push(uploadImg(blob));
        }
        Promise.all(reqList)
          .then((resList) => {
            const urlList: any[] = [];
            for (const res of resList) {
              if (res.status === 200 && res.data.code === 200) {
                urlList.push(res.data.data.url);
              }
            }
            const document = vscode.workspace.openTextDocument({
              language: "javascript",
              content: urlList.join("\n"),
            });
            document.then((doc) => {
              vscode.window.showTextDocument(doc);
            });
          })
          .catch(() => {
            vscode.window.showErrorMessage("上传失败，请重试");
          });
      })
      .catch((err) => {
        console.error("err:", err);
        vscode.window.showInformationMessage(
          `Uploaded [${this.targetFilePath}] failed: ${err}`
        );
      });
  }

  run() {
    fs.ensureDir(this.targetFilePath)
      .then(() => {
        this.uploadDirectory();
      })
      .catch(() => {
        // img
        this.uploadImage();
      });
  }
}

export default ImageUploader;
