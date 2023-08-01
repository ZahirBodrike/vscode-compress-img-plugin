import * as vscode from "vscode";
import { disposable } from "./index";

export function activate(context: vscode.ExtensionContext) {
  try {
    context.subscriptions.push(disposable);
  } catch (err) {
    console.log(err);
  }
}

export function deactivate() {}
