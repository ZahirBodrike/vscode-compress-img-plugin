import * as vscode from "vscode";
import {
  compressAndCoverDisposable,
  compressAndCreateDisposable,
} from "./index";

export function activate(context: vscode.ExtensionContext) {
  try {
    context.subscriptions.push(compressAndCoverDisposable);
    context.subscriptions.push(compressAndCreateDisposable);
  } catch (err) {
    console.log(err);
  }
}

export function deactivate() {}
