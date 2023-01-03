"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateTutorialWebView = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
//activateAfkWebview is called upon extension start and registers necessary commands for afk functionality
async function activateTutorialWebView(context) {
    //register afk provider by calling class constructor
    const provider = new TutorialWebViewprovider(context.extensionUri);
    //push and regsitser necessary commands
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(TutorialWebViewprovider.viewType, provider));
    context.subscriptions.push(vscode.commands.registerCommand('gigo.tutorial.start', () => {
        //provider.start();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('gigo.tutorial.next', () => {
        provider.nextTutorial();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('gigo.tutorial.previous', () => {
        provider.previousTutorial();
    }));
    console.log("before start");
    //await provider.start();
    console.log("after start");
    // context.subscriptions.push(
    // 	vscode.commands.registerCommand('gigo.disableAFK', () => {
    // 		provider.disableAFK();
    // 	}));
}
exports.activateTutorialWebView = activateTutorialWebView;
//afk webview provider has basic functions for handling afk system
class TutorialWebViewprovider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        //defining local variables
        this.themeConfigSection = 'markdown-preview-github-styles';
        this.themeConfigKey = 'colorTheme';
        this.defaultThemeConfiguration = 'auto';
        this.isTutorialActive = true;
        //defining base color pallettes
        this.themeConfigValues = {
            'auto': true,
            'system': true,
            'light': true,
            'dark': true
        };
        this.currentPage = 0;
        // load configuration value for afk from
        let gigoConfig = vscode.workspace.getConfiguration("gigo");
        this.isTutorialActive = gigoConfig.get("gigo.tutorial.on");
        //this.disableAFK();
    }
    async start() {
        if (this._view) {
            //ensure that user has opened a project before continuing
            if (!vscode.workspace.workspaceFolders) {
                vscode.window.showInformationMessage("Open a folder/workspace first");
                return;
            }
            //set base path of workspace for future file handling 
            console.log('workspace: ', vscode.workspace);
            this.baseWorkspaceUri = vscode.workspace.workspaceFolders[0].uri;
            this.baseWorkspaceUri.fsPath.replace("file://", "");
            console.log("this: " + this.baseWorkspaceUri.fsPath.replace("file://", ""));
            //determine first README to start on
            this._getCurrentPage(this._view.webview);
            if (this._view) {
                this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
                await this._getHtmlForWebview(this._view.webview);
            }
            // //call render for first page
            // this.render(this.tuitorialPanel, context);
            // //rerender whenever page changes
            // this.tuitorialPanel.onDidChangeViewState((e) => {
            //     this.render(e.webviewPanel, context);
            // });
        }
    }
    //_getCurrentPage retrieves the number of the current page from the configfile
    _getCurrentPage(webview) {
        //get message from message hander of current page number
        webview.onDidReceiveMessage(async (message) => {
            const command = message.command;
            const text = message.text;
            //verify command received is currentPage and write to config file
            switch (command) {
                case "currentPage":
                    try {
                        const fs = require('fs');
                        //create json formatted string
                        let yamlContent = `{\"currentPageNum\": ${text}}`;
                        //write json formatted string to config file
                        fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", yamlContent);
                        //render page with current page number as main page
                        if (this._view) {
                            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
                            await this._getHtmlForWebview(this._view.webview);
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                    return;
            }
        }, undefined);
    }
    //resolveWebviewView handles editor callback functions and basic html render
    async resolveWebviewView(webviewView, context, _token) {
        // if (this.baseWorkspaceUri.fsPath === undefined) {
        //     return;
        // }
        this._view = webviewView;
        //setup webview
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        //ensure that user has opened a project before continuing
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showInformationMessage("Open a folder/workspace first");
            return;
        }
        //set base path of workspace for future file handling 
        console.log('workspace: ', vscode.workspace);
        this.baseWorkspaceUri = vscode.workspace.workspaceFolders[0].uri;
        this.baseWorkspaceUri.fsPath.replace("file://", "");
        console.log("this: " + this.baseWorkspaceUri.fsPath.replace("file://", ""));
        if (this._view) {
            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._getCurrentPage(this._view.webview);
            await this._getHtmlForWebview(this._view.webview);
            console.log("view: " + this._view.webview.html);
        }
        //callback for registered commands
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'tutorial.start':
                    //call enable afk function when enableAFK command is called
                    // this.start();
                    break;
                case 'tutorial.next':
                    //call disable afk function when disableAFK command is called
                    this.nextTutorial();
                    break;
                case 'tutorial.previous':
                    this.previousTutorial();
                    break;
                case "hello":
                    //display message when hello command is called
                    vscode.window.showInformationMessage(data.text);
                    return;
            }
        });
    }
    nextTutorial() {
        vscode.window.showInformationMessage("changing to next page");
    }
    previousTutorial() {
        vscode.window.showInformationMessage("changing to previous page");
    }
    //addColor sends color message to messsage handler
    addColor() {
        if (this._view) {
            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.postMessage({ type: 'addColor' });
        }
    }
    //clearColors sends color message to clear colors to message handler
    clearColors() {
        if (this._view) {
            this._view.webview.postMessage({ type: 'clearColors' });
        }
    }
    //_getHtmlForWebview renders afk enbaled and disabled pages
    async _getHtmlForWebview(webview) {
        {
            await this._getHtml(webview);
        }
    }
    //findMDFiles finds all markdown files in the workspace folder
    async findMDFiles() {
        var mdArr = [];
        try {
            const fs = require('fs');
            const markdown = require('markdown-it');
            const shiki = require('shiki');
            var md;
            //use shikit to render markdown syntax and get all markdown files
            await shiki.getHighlighter({
                theme: 'github-dark'
            }).then((highlighter) => {
                //render markdown with shiki highlighter
                const md = markdown({
                    html: true,
                    highlight: (code, lang) => {
                        return highlighter.codeToHtml(code, { lang });
                    }
                });
                //get path to tutorial
                let tuitotialPaths = this.baseWorkspaceUri.fsPath + "/.tutorials/";
                console.log(tuitotialPaths);
                //get all README files from file path and push to markdown array
                fs.readdir(tuitotialPaths, (err, files) => {
                    files.forEach((f) => {
                        //console.log(md.render(fs.readFileSync(`${tuitotialPaths}${f}`, 'utf-8')));
                        mdArr.push(md.render(fs.readFileSync(`${tuitotialPaths}${f}`, 'utf-8')));
                    });
                    console.log("mdarrr: " + mdArr.length);
                });
            });
        }
        catch (err) {
            console.log(err);
        }
        console.log("mdarrr: " + mdArr.length);
        //return markdown array
        return await mdArr;
    }
    getUri(webview, extensionUri, pathList) {
        return webview.asWebviewUri(vscode_1.Uri.joinPath(extensionUri, ...pathList));
    }
    //_getAfkDisabledHtml renders page for when afk is disabled
    async _getHtml(webview) {
        //get markdown files
        let mds = await this.findMDFiles();
        //init packages
        const fs = require('fs');
        console.log("length of mds: " + mds.length);
        console.log("mds: " + mds);
        const markdown = require('markdown-it');
        const shiki = require('shiki');
        //get shiki highlighter
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
            //check if tutorial config exists and get current page number
            try {
                //if tutorial config exists get current page number from it
                if (fs.existsSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json")) {
                    let obj = JSON.parse(fs.readFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", 'utf8'));
                    currentPgNum = obj.currentPageNum;
                }
                else {
                    //if tutorial config does not exist create it and set current page number to 1
                    let yamlContent = "{\"currentPageNum\": 1}";
                    fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", yamlContent);
                    currentPgNum = 1;
                }
            }
            catch (err) {
                console.log(err);
                return;
            }
            console.log("currentPgNum: " + currentPgNum);
            //html of previous button
            var previousButton = `<button class="enable-gigo-tutorial-previous-button">Previous Tutorial</button>`;
            //if current page number is 1 disable previoous button
            if (currentPgNum === 1) {
                previousButton = ` <button disabled class="enable-gigo-tutorial-previous-button">Previous Tutorial</button>`;
            }
            //html of next button
            var nextButton = `<button class="enable-gigo-tutorial-next-button">Next Tutorial</button>`;
            //if current page number is last page disable next button
            if (currentPgNum >= mds.length) {
                nextButton = `<button disabled class="enable-gigo-tutorial-next-button">Next Tutorial</button>`;
            }
            //set current index to bed 1 less than current page
            let index = currentPgNum - 1;
            // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
            const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'tutorial', 'media', 'buttons.js'));
            // Do the same for the stylesheet.
            const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'tutorial', 'media', 'reset.css'));
            const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'tutorial', 'media', 'vscode.css'));
            const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'tutorial', 'media', 'main.css'));
            // Use a nonce to only allow a specific script to be run.
            const nonce = getNonce();
            if (this._view) {
                this._view.webview.html = `<!DOCTYPE html>
			<html lang="en">
            <input name="currentPgNum" type="hidden" value="${currentPgNum}"></input>
            <input name="maxPageNum" type="hidden" value="${mds.length}"></input>
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>GIGO AFK Session</title>
			</head>
            <div id="big">
                ${mds[index]}
            </div>
			<body>
                <br/>
                <br/>
                <div id="nextButton">
                    ${nextButton}
                </div>
                <div id="previousButton">
                    ${previousButton}
                </div>
                
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
            }
        });
    }
}
TutorialWebViewprovider.viewType = 'gigo.tutorialView';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=webview.js.map