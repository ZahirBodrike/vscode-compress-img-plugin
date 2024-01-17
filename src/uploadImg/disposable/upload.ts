import * as vscode from "vscode";
import ImageUploader from "../base";

export const uploadImgDisposable = vscode.commands.registerCommand(
  "ieg-vscode-plugin.uploadImg",
  (e) => {
    const targetFilePath = e.path;
    const uploader = new ImageUploader({
      targetFilePath,
    });
    uploader.run();
  }
);
