import * as vscode from "vscode";
import * as fs from "fs-extra";
import { compressImgList, CompressImg } from "./core";
import { isImgFile } from "./util/tool";

export function activate(context: vscode.ExtensionContext) {
  try {
    let disposable = vscode.commands.registerCommand(
      "ieg-vscode-plugin.compress",
      (e) => {
        const targetFilePath = e.path;
        console.log("current file: ", targetFilePath);

        fs.ensureDir(targetFilePath)
          .then(() => {
            console.log("target file is a dir!");
            fs.readdir(targetFilePath)
              .then((data) => {
                console.log("data", data);
                vscode.window.showInformationMessage(
                  `Compressing... dir: ${targetFilePath}`
                );
                compressImgList(data, targetFilePath).then(() => {
                  vscode.window.showInformationMessage("Compress finished.");
                });
              })
              .catch((err) => {
                vscode.window.showInformationMessage(err);
              });
          })
          .catch(() => {
            if (isImgFile(targetFilePath)) {
              vscode.window.showInformationMessage(
                `Compressing... img: ${targetFilePath}`
              );
              CompressImg(targetFilePath).then(({ type, msg }) => {
                vscode.window.showInformationMessage("Compress finished.");
                if (type === "fail") {
                  vscode.window.showErrorMessage(msg);
                }
              });
            } else {
              vscode.window.showErrorMessage(
                "Sorry man. This file is not a img file."
              );
            }
          });
      }
    );
    context.subscriptions.push(disposable);
  } catch (err) {
    console.log(err);
  }
}

export function deactivate() {}
