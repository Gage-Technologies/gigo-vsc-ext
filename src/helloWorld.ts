'use strict';
import * as vscode from 'vscode';


import { Uri, Webview } from "vscode";

export class HelloWorldPanel {
    public static currentPanel: HelloWorldPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
  
    public constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
      this._panel = panel;
      this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
      this._panel.onDidDispose(this.dispose, null, this._disposables);
      this._setWebviewMessageListener(this._panel.webview);
    }
    
    

    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
          (message: any) => {
            const command = message.command;
            const text = message.text;
    
          },
          undefined,
          this._disposables
        );
    }

    public dispose() {
      HelloWorldPanel.currentPanel = undefined;
  
      this._panel.dispose();
  
      while (this._disposables.length) {
        const disposable = this._disposables.pop();
        if (disposable) {
          disposable.dispose();
        }
      }
    }

    public activate(context: vscode.ExtensionContext){

      const helloCommand = vscode.commands.registerCommand("hello-world.helloWorld", () => {
          HelloWorldPanel.render(context.extensionUri);
        });
      
      context.subscriptions.push(helloCommand);
    }


  public static render(extensionUri: vscode.Uri) {
    if (HelloWorldPanel.currentPanel) {
      HelloWorldPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
        const panel = vscode.window.createWebviewPanel("hello-world", "Hello World", vscode.ViewColumn.One, {
            enableScripts: true,
          });

      HelloWorldPanel.currentPanel = new HelloWorldPanel(panel, extensionUri);

    
    }
  }

  private getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
  }

    // file: src/panels/HelloWorldPanel.ts

  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    // ... other code ...
  
    const mainUri = this.getUri(webview, extensionUri, ["src", "main.js"]);


    const toolkitUri = this.getUri(webview, extensionUri, [
        "node_modules",
        "@vscode",
        "webview-ui-toolkit",
        "dist",
        "toolkit.js", // A toolkit.min.js file is also available
      ]);
  
    return /*html*/ `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width,initial-scale=1.0">
            <script type="module" src="${toolkitUri}"></script>
            <script type="module" src="${mainUri}"></script>
            <title>Hello World!</title>
        </head>
        <body>
            <h1>Hello World!</h1>
            <vscode-button id="howdy">Howdy!</vscode-button>
        </body>
        </html>
    `;
  }

}
