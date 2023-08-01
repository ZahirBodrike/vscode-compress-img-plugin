import ImageCompress, { ECompressType } from "../index";
import * as vscode from "vscode";

export const compressAndCreateDisposable = vscode.commands.registerCommand(
  "ieg-vscode-compress-plugin.compressAndCreate",
  (e) => {
    const targetFilePath = e.path;
    const compress = new ImageCompress({
      type: ECompressType.Create,
      targetFilePath,
    });
    compress.run();
  }
);
