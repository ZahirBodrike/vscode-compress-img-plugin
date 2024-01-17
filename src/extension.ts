import * as vscode from "vscode";
import { compressAndCoverDisposable } from "./compressImg/disposable/compressAndCover";
import { compressAndCreateDisposable } from "./compressImg/disposable/compressAndCreate";
import { uploadImgDisposable } from "./uploadImg/disposable/upload";

export function activate(context: vscode.ExtensionContext) {
  try {
    context.subscriptions.push(compressAndCoverDisposable);
    context.subscriptions.push(compressAndCreateDisposable);
    context.subscriptions.push(uploadImgDisposable);
  } catch (err) {
    console.log(err);
  }
}

export function deactivate() {}
