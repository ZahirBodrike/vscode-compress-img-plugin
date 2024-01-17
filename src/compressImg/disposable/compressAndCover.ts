import ImageCompress, { ECompressType } from "../base";
import * as vscode from "vscode";

export const compressAndCoverDisposable = vscode.commands.registerCommand(
  "ieg-vscode-plugin.compressAndCover",
  (e) => {
    const targetFilePath = e.path;
    const compress = new ImageCompress({
      type: ECompressType.Cover,
      targetFilePath,
    });
    compress.run();
  }
);
