'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
class Tutorial {
    constructor(context) {
        this.themeConfigSection = 'markdown-preview-github-styles';
        this.themeConfigKey = 'colorTheme';
        this.defaultThemeConfiguration = 'auto';
        this.themeConfigValues = {
            'auto': true,
            'system': true,
            'light': true,
            'dark': true
        };
        this.currentPage = 0;
        this.context = context;
        vscode.commands.registerCommand("controls.start", () => {
            let currentPanel = vscode.window.createWebviewPanel("controls", "Page Controls", vscode.ViewColumn.Active, {
                enableScripts: true,
            });
            this.tuitorialPanel = currentPanel;
            this._getCurrentPage(currentPanel.webview);
            this._setWebviewMessageListener(currentPanel.webview);
            if (!vscode.workspace.workspaceFolders) {
                vscode.window.showInformationMessage("Open a folder/workspace first");
                return;
            }
            this.baseWorkspaceUri = vscode.workspace.workspaceFolders[0].uri;
            this.baseWorkspaceUri.fsPath.replace("file://", "");
            this.render(this.tuitorialPanel, context);
            this.tuitorialPanel.onDidChangeViewState((e) => {
                this.render(e.webviewPanel, context);
            });
        });
    }
    _getCurrentPage(webview) {
        webview.onDidReceiveMessage((message) => {
            const command = message.command;
            const text = message.text;
            switch (command) {
                case "currentPage":
                    try {
                        const fs = require('fs');
                        let yamlContent = `{\"currentPageNum\": ${text}}`;
                        fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", yamlContent);
                        this.render(this.tuitorialPanel, this.context);
                    }
                    catch (err) {
                        console.log(err);
                    }
                    return;
            }
        }, undefined);
    }
    async findMDFiles() {
        var mdArr = [];
        try {
            const fs = require('fs');
            const markdown = require('markdown-it');
            const shiki = require('shiki');
            var md;
            await shiki.getHighlighter({
                theme: 'github-dark'
            }).then((highlighter) => {
                const md = markdown({
                    html: true,
                    highlight: (code, lang) => {
                        return highlighter.codeToHtml(code, { lang });
                    }
                });
                let tuitotialPaths = this.baseWorkspaceUri.fsPath + "/.tutorials/";
                fs.readdir(tuitotialPaths, (err, files) => {
                    files.forEach((f) => {
                        mdArr.push(md.render(fs.readFileSync(`${tuitotialPaths}${f}`, 'utf-8')));
                    });
                });
            });
        }
        catch (err) {
            console.log(err);
        }
        return mdArr;
    }
    async render(panel, context) {
        let mds = await this.findMDFiles();
        const fs = require('fs');
        const markdown = require('markdown-it');
        const shiki = require('shiki');
        shiki.getHighlighter({
            theme: 'github-dark'
        }).then((highlighter) => {
            const md = markdown({
                html: true,
                highlight: (code, lang) => {
                    return highlighter.codeToHtml(code, { lang });
                }
            });
            var currentPgNum;
            try {
                if (fs.existsSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json")) {
                    let obj = JSON.parse(fs.readFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", 'utf8'));
                    currentPgNum = obj.currentPageNum;
                }
                else {
                    let yamlContent = "{\"currentPageNum\": 1}";
                    fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", yamlContent);
                    currentPgNum = 1;
                }
            }
            catch (err) {
                console.log(err);
                return;
            }
            const mainUri = this.getUri(panel.webview, context.extensionUri, ["src", "main.js"]);
            const toolkitUri = this.getUri(panel.webview, context.extensionUri, [
                "node_modules",
                "@vscode",
                "webview-ui-toolkit",
                "dist",
                "toolkit.js", // A toolkit.min.js file is also available
            ]);
            var previousButton = ` <vscode-button id="previousTutorial">Previous Tutorial</vscode-button>`;
            if (currentPgNum === 1) {
                previousButton = ` <vscode-button id="previousTutorial" disabled>Previous Tutorial</vscode-button>`;
            }
            var nextButton = `<vscode-button id="nextTutorial">Next Tutorial</vscode-button>`;
            if (currentPgNum >= mds.length) {
                nextButton = `<vscode-button id="nextTutorial" disabled>Next Tutorial</vscode-button>`;
            }
            let index = currentPgNum - 1;
            const out = `
                <title>Shiki</title>
                <link rel="stylesheet" href="style.css">
                <input name="currentPgNum" type="hidden" value="${currentPgNum}"></input>
                <input name="maxPageNum" type="hidden" value="${mds.length}"></input>
                
                <div id="big">
                ${mds[index]}
                </div>
                <script type="module" src="fs.js"></script>
                <script src="https://unpkg.com/shiki"></script>
                <script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/12.2.0/markdown-it.js"></script>
                <script src="index.js"></script>
                </head>
                <body>
                    ${previousButton}   
                    ${nextButton}
                   
                </body>
                <script type="module" src="${mainUri}"></script>
                <script type="module" src="${toolkitUri}"></script>
        
            `;
            panel.webview.html = out;
        });
    }
    async loadHtml(webview, html) {
        webview = html;
    }
    dispose() {
    }
    getColorTheme() {
        const settings = vscode.workspace.getConfiguration(this.themeConfigSection, null);
        return this.validThemeConfigurationValue(settings.get(this.themeConfigKey, this.defaultThemeConfiguration));
    }
    validThemeConfigurationValue(theme) {
        return !this.themeConfigValues[theme]
            ? this.defaultThemeConfiguration
            : theme;
    }
    getUri(webview, extensionUri, pathList) {
        return webview.asWebviewUri(vscode_1.Uri.joinPath(extensionUri, ...pathList));
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
        }, undefined);
    }
    plugin(md) {
        const render = md.renderer.render;
        md.renderer.render = function () {
            return `<div class="github-markdown-body github-markdown-${this.getColorTheme()}">
                <div class="github-markdown-content">${render.apply(md.renderer, arguments)}</div>
            </div>`;
        };
        return md;
    }
}
exports.default = Tutorial;
//# sourceMappingURL=tutorial.js.map