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
            //console.log(mainUri);
            console.log('done');
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
                        console.log(`currentPageNum: ${text}`);
                        const fs = require('fs');
                        let yamlContent = `{\"currentPageNum\": ${text}}`;
                        fs.writeFileSync("/home/user/Development/Fun/hopeThisWorks/config.json", yamlContent);
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
            //const t = shiki.loadTheme(join(process.cwd(), 'vscode.theme-kimbie-dark'));
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
                let tuitotialPaths = this.baseWorkspaceUri.fsPath + "/.tuitorials/";
                console.log();
                fs.readdir(tuitotialPaths, (err, files) => {
                    //console.log(`error: ${err}`);
                    files.forEach((f) => {
                        //console.log(`file: ${f}`);
                        mdArr.push(md.render(fs.readFileSync(`${tuitotialPaths}${f}`, 'utf-8')));
                        console.log(`here: ${mdArr.length}`);
                        // console.log(md.render(fs.readFileSync(`${tuitotialPaths}${f}`, 'utf-8')))
                    });
                });
                console.log("internal length: ", mdArr.length);
                //return mdArr;
            });
        }
        catch (err) {
            console.log(err);
        }
        console.log("md length: ", mdArr.length);
        return mdArr;
    }
    async render(panel, context) {
        //console.log(panel.workspace)
        console.log("before find");
        let mds = await this.findMDFiles();
        //this.findMDFiles(context);
        console.log("re render");
        const fs = require('fs');
        const markdown = require('markdown-it');
        const shiki = require('shiki');
        //const t = shiki.loadTheme(join(process.cwd(), 'vscode.theme-kimbie-dark'));
        shiki.getHighlighter({
            theme: 'github-dark'
        }).then((highlighter) => {
            const md = markdown({
                html: true,
                highlight: (code, lang) => {
                    return highlighter.codeToHtml(code, { lang });
                }
            });
            let html = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/.tuitorials/tuitorial-1.md", 'utf-8'));
            let html2 = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/.tuitorials/tuitorial-2.md", 'utf-8'));
            //console.log(html2);
            var currentPgNum;
            var htmlList = "";
            try {
                if (fs.existsSync("/home/user/Development/Fun/hopeThisWorks/config.json")) {
                    let obj = JSON.parse(fs.readFileSync('/home/user/Development/Fun/hopeThisWorks/config.json', 'utf8'));
                    currentPgNum = obj.currentPageNum;
                    console.log(`current#1: ${currentPgNum}`);
                }
                else {
                    let yamlContent = "{\"currentPageNum\": 1}";
                    fs.writeFileSync("/home/user/Development/Fun/hopeThisWorks/config.json", yamlContent);
                    currentPgNum = 1;
                    console.log(`current#2: ${currentPgNum}`);
                }
                console.log(`current#3: ${currentPgNum}`);
                //let sortedmds = mds.sort();
                console.log(`mds: ${mds}`);
                let i = 1;
                for (var mdrs in mds) {
                    htmlList += `<script id="t-${mdrs}" type="module">${mds[mdrs]}</script>`;
                    i += 1;
                }
                console.log("#############################################################################################################################################");
                console.log(htmlList);
                console.log("#############################################################################################################################################");
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
            //window.showTextDocument(fileUri, { preview: false });
            var previousButton = ` <vscode-button id="previousTuitorial">Previous Tuitorial</vscode-button>`;
            if (currentPgNum === 1) {
                previousButton = "";
            }
            var nextButton = `<vscode-button id="nextTuitorial">Next Tuitorial</vscode-button>`;
            if (currentPgNum >= mds.length) {
                nextButton = "";
            }
            const out = `
                <title>Shiki</title>
                <link rel="stylesheet" href="style.css">
                <script id="currentPgNum" type="module" src="${currentPgNum}"></script>
                <script id="maxPageNum" type="module" src="${mds.length + 1}"></script>
                <div id="big">
                ${mds[currentPgNum - 1]}
                </div>
                ${htmlList}
                <script type="module" src="${mainUri}"></script>
                <script type="module" src="${toolkitUri}"></script>
                <script type="module" src="fs.js"></script>
                <script src="https://unpkg.com/shiki"></script>
                <script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/12.2.0/markdown-it.js"></script>
                <script src="index.js"></script>
                </head>
                <body>
                    ${previousButton}   
                    ${nextButton}
                   
                </body>
            
            `;
            panel.webview.html = out;
        });
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
    activate(context) {
        // console.log(this.getColorTheme());
        context.subscriptions.push(vscode.commands.registerCommand("controls.start", () => {
            let currentPanel = vscode.window.createWebviewPanel("controls", "Page Controls", vscode.ViewColumn.Active, {
                enableScripts: true,
            });
            this._setWebviewMessageListener(currentPanel.webview);
            const fs = require('fs');
            const markdown = require('markdown-it');
            const shiki = require('shiki');
            //const t = shiki.loadTheme(join(process.cwd(), 'vscode.theme-kimbie-dark'));
            shiki.getHighlighter({
                theme: 'github-dark'
            }).then((highlighter) => {
                const md = markdown({
                    html: true,
                    highlight: (code, lang) => {
                        return highlighter.codeToHtml(code, { lang });
                    }
                });
                const mainUri = this.getUri(currentPanel.webview, context.extensionUri, ["src", "main.js"]);
                const toolkitUri = this.getUri(currentPanel.webview, context.extensionUri, [
                    "node_modules",
                    "@vscode",
                    "webview-ui-toolkit",
                    "dist",
                    "toolkit.js", // A toolkit.min.js file is also available
                ]);
                const html = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/tuitorial-1.md", 'utf-8'));
                const out = `
                    <title>Shiki</title>
                    <link rel="stylesheet" href="style.css">
                    ${html}
                    <script type="module" src="${mainUri}"></script>
                    <script type="module" src="${toolkitUri}"></script>
                    </head>
                    <body>
                        <vscode-button id="nextTuitorial">Next Tuitorial</vscode-button>
                    </body>
                
                `;
                currentPanel.webview.html = out;
                console.log('done');
            });
        }), vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(this.themeConfigSection)) {
                vscode.commands.executeCommand('markdown.preview.refresh');
            }
        }));
        let plugin = this.plugin;
        return {
            extendMarkdownIt(md) {
                return md.use(plugin);
            }
        };
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