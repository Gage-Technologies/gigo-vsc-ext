'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelloWorldPanel = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
class HelloWorldPanel {
    constructor(panel, extensionUri) {
        this._disposables = [];
        this._panel = panel;
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
        this._panel.onDidDispose(this.dispose, null, this._disposables);
        this._setWebviewMessageListener(this._panel.webview);
    }
    _setWebviewMessageListener(webview) {
        webview.onDidReceiveMessage((message) => {
            const command = message.command;
            const text = message.text;
            switch (command) {
                case "hello":
                    vscode.window.showInformationMessage(text);
                    return;
            }
        }, undefined, this._disposables);
    }
    dispose() {
        HelloWorldPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
    activate(context) {
        console.log("activating hello world");
        const helloCommand = vscode.commands.registerCommand("hello-world.helloWorld", () => {
            HelloWorldPanel.render(context.extensionUri);
        });
        context.subscriptions.push(helloCommand);
    }
    static render(extensionUri) {
        if (HelloWorldPanel.currentPanel) {
            HelloWorldPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
        }
        else {
            const panel = vscode.window.createWebviewPanel("hello-world", "Hello World", vscode.ViewColumn.One, {
                enableScripts: true,
            });
            HelloWorldPanel.currentPanel = new HelloWorldPanel(panel, extensionUri);
        }
    }
    getUri(webview, extensionUri, pathList) {
        return webview.asWebviewUri(vscode_1.Uri.joinPath(extensionUri, ...pathList));
    }
    // file: src/panels/HelloWorldPanel.ts
    _getWebviewContent(webview, extensionUri) {
        // ... other code ...
        const mainUri = this.getUri(webview, extensionUri, ["src", "main.js"]);
        console.log("main file: ", mainUri);
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
exports.HelloWorldPanel = HelloWorldPanel;
//# sourceMappingURL=helloWorld.js.map