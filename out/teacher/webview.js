"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateTeacherWebView = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
//activateAfkWebview is called upon extension start and registers necessary commands for afk functionality
async function activateTeacherWebView(context) {
    //register afk provider by calling class constructor
    const provider = new TeacherWebViewprovider(context.extensionUri);
    if (provider.codeTour) {
        provider.codeTour.activate();
    }
    //push and regsitser necessary commands
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(TeacherWebViewprovider.viewType, provider));
}
exports.activateTeacherWebView = activateTeacherWebView;
//afk webview provider has basic functions for handling afk system
class TeacherWebViewprovider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        //defining local variables
        this.themeConfigSection = 'markdown-preview-github-styles';
        this.themeConfigKey = 'colorTheme';
        this.defaultThemeConfiguration = 'auto';
        this.isTutorialActive = true;
        this.minPages = 1;
        this.maxPages = 8;
        this.numOfTutorials = 0;
        this.pageButtonsHTML = "";
        this.tourSteps = [];
        this.codeTour = vscode.extensions.getExtension("vsls-contrib.codetour");
        //defining base color pallettes
        this.themeConfigValues = {
            'auto': true,
            'system': true,
            'light': true,
            'dark': true
        };
        this.currentPage = 0;
        const fs = require('fs');
        console.log(fs.readFileSync("/home/user/.gigo/ws-config.json", 'utf-8'));
        this.loadingIcon = `<div id="loadingAnim" style="display:none">
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <lottie-player src="https://assets3.lottiefiles.com/packages/lf20_DVSwGQ.json"  background="transparent"  speed="1"  style="width: 300px; height: 300px;"  loop  autoplay></lottie-player>
        </div>`;
        this.submitButton = `<div class="buttonWrapper">
        <button class="submitButton" onclick="submitFunc()">Fix My Code</button>
        </div>`;
        this.inputBox1 = `<div class="input-group">
        <label class="inputTitle">Code</label>
        <textarea class="inputBox" name="inputBox1" rows="10" cols="10" wrap="soft"></textarea>
        </div>`;
        this.inputBox2 = `<div class="input-group">
        <text class="inputTitle">Error</text>
        <textarea class="inputBox" name="inputBox2" rows="10" cols="10" wrap="soft"></textarea>
        </div>`;
        this.loadingTitle = `<div hidden class="loadingTitle"><text class="loadingText">Your code is being processed by a bot.\nRemeber copying code is only based if you understand it.</text></div>`;
        // load configuration value for afk from
        // let gigoConfig = vscode.workspace.getConfiguration("gigo");
        // this.isTutorialActive = gigoConfig.get("gigo.tutorial.on");
    }
    //_getCurrentPage retrieves the number of the current page from the configfile
    _getCurrentPage(webview) {
        //get message from message hander of current page number
        webview.onDidReceiveMessage(async (message) => {
            const command = message.command;
            const text = message.text;
            //verify command received is currentPage and write to config file
            switch (command) {
                case "loadingIcon":
                    try {
                        if (this._view) {
                            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
                            if (message.text === "enable") {
                                this.loadingIcon = `<div id="loadingAnim">
                                    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
                                    <lottie-player src="https://assets3.lottiefiles.com/packages/lf20_DVSwGQ.json"  background="transparent"  speed="1"  loop  autoplay></lottie-player>
                                    </div>`;
                                this.submitButton = `<div class="buttonWrapper">
                                    <button disabled class="submitButton"><div class="button--loading"/></button>
                                    </div>`;
                                this.inputBox1 = `<div hidden class="input-group">
                                    <label class="inputTitle">Code</label>
                                    <textarea class="inputBox" name="inputBox1" rows="10" cols="10" wrap="soft"></textarea>
                                    </div>`;
                                this.inputBox2 = `<div hidden class="input-group">
                                    <text class="inputTitle">Error</text>
                                    <textarea class="inputBox" name="inputBox2" rows="10" cols="10" wrap="soft"></textarea>
                                    </div>`;
                                this.loadingTitle = `<div class="loadingTitle"><text class="loadingText">Your code is being processed by a bot.\nRemeber copying code is only based if you understand it.</text></div>`;
                            }
                            else {
                                this.loadingIcon = `<div id="loadingAnim" style="display:none">
                                    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
                                    <lottie-player src="https://assets3.lottiefiles.com/packages/lf20_DVSwGQ.json"  background="transparent"  speed="1"  loop  autoplay></lottie-player>
                                    </div>`;
                                this.submitButton = `<div class="buttonWrapper">
                                    <button class="submitButton" onclick="submitFunc()">Fix My Code</button>
                                    </div>`;
                                this.inputBox1 = `<div class="input-group">
                                    <label class="inputTitle">Code</label>
                                    <textarea class="inputBox" name="inputBox1" rows="10" cols="10" wrap="soft"></textarea>
                                    </div>`;
                                this.inputBox2 = `<div class="input-group">
                                    <text class="inputTitle">Error</text>
                                    <textarea class="inputBox" name="inputBox2" rows="10" cols="10" wrap="soft"></textarea>
                                    </div>`;
                                this.loadingTitle = `<div hidden class="loadingTitle"><text class="loadingText">Your code is being processed by a bot.\nRemeber copying code is only based if you understand it.</text></div>`;
                            }
                            console.log(this.loadingIcon);
                            await this._getHtml(this._view.webview);
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
            }
        }, undefined);
    }
    //resolveWebviewView handles editor callback functions and basic html render
    async resolveWebviewView(webviewView, context, _token) {
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
        this.baseWorkspaceUri = vscode.workspace.workspaceFolders[0].uri;
        this.baseWorkspaceUri.fsPath.replace("file://", "");
        if (this._view) {
            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._getCurrentPage(this._view.webview);
            await this._getHtmlForWebview(this._view.webview, "");
        }
        //callback for registered commands
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case "hello":
                    //display message when hello command is called
                    vscode.window.showInformationMessage(data.text);
                    return;
            }
        });
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
    async _getHtmlForWebview(webview, group) {
        {
            await this._getHtml(webview);
        }
    }
    getUri(webview, extensionUri, pathList) {
        return webview.asWebviewUri(vscode_1.Uri.joinPath(extensionUri, ...pathList));
    }
    // public sync codeRequest(){
    //       //awair result from http function in GIGO
    //     let res = await axios.post(
    //         "http://gigo.gage.intranet/api/internal/ws/afk", 
    //         {
    //             // eslint-disable-next-line @typescript-eslint/naming-convention
    //             "coder_id": wsID,
    //             "secret": secret,
    //             // eslint-disable-next-line @typescript-eslint/naming-convention
    //             "add_min": addMin
    //         }
    //     );
    //     //if non status code 200 is returned, return -1 and log failure message
    //     if (res.status !== 200) { 
    //         console.log("failed to execute live-check: ", res);
    //         return -1;
    //     }
    //     //set afk variable to true
    //     isAFK = true;
    //     //return afk timestamp
    //     return res.data.expiration;
    // }
    //_getAfkDisabledHtml renders page for when afk is disabled
    //takes in a group string to determine whether to render the whole page or
    //to just render the next and last group page controls
    async _getHtml(webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'teacher', 'media', 'buttons.js'));
        // Do the same for the stylesheet.
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'tutorial', 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'tutorial', 'media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'teacher', 'media', 'main.css'));
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();
        if (this._view) {
            //render the html for the page by passing it to the view
            this._view.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <!--
                Use a content security policy to only allow loading styles from our extension directory,
                and only allow scripts that have a specific nonce.
                (See the 'webview-sample' extension sample for img-src content security policy examples)
            -->
            <meta http-equiv="Content-Security-Policy" default-src * 'unsafe-inline' 'unsafe-eval'; script-src ${webview.cspSource} img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${styleResetUri}" rel="stylesheet">
            <link href="${styleVSCodeUri}" rel="stylesheet">
            <link href="${styleMainUri}" rel="stylesheet">
         
            <title>GIGO Code Teacher</title>
        </head>
        <div class = "betaAnimation">
            <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script> 
            <lottie-player src="https://lottie.host/e7405d0c-ceaa-42a4-accf-5699b5009196/VIpLHU1HM2.json" background="transparent" speed="1" loop autoplay></lottie-player> 
        </div>
        <details><summary><b class="aboutTitle">About Code Teacher</b></summary>
            <div id="aboutContent" class="aboutText">
                <div class="big">
                    GIGO Code Teacher is an AI system that helps users interpret error messages and understand problems in their code. It is a powerful tool designed to assist developers in quickly identifying errors, as well as providing explanations for why they occurred.
                </div>
                <div class="codeTeacherAnimation">
                    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
                    <lottie-player src="https://assets7.lottiefiles.com/private_files/lf30_Fy9W8c.json"  background="transparent"  speed=".6"    loop  autoplay></lottie-player>   <body>
                </div>
                <div class="big">
                    During its experimental Beta release, you can enjoy using Code Teacher for free while it continues to learn and improve with each use. However, please note that since this is an experimental system at times the responses may be incorrect or incoherent so always double-check before making any changes based on the advice provided by Code Teacher.
                </div>
            </div>
        </details>
       
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            
            <div class="inputs">
                ${this.inputBox1}
                <br/>
                <br/>
                ${this.inputBox2}
                ${this.loadingTitle}
                ${this.loadingIcon}
                <br/>
                <br/>
                ${this.submitButton}
            </div>

            <br/>
            <br/>
            <br/>
            <br/>

            
            
            <div class="outputBox">
                <label class="outputTitle">Solution</label>
                <br/>
                <br/>
                <div class="solutionBox">
                    <code class="solutionCode" name="outputBox" rows="5" cols="10" wrap="soft">
                        <pre>
import chad-lang
import os

def isBased():
    for i in os.opendir("/daniel-gym-photos/):
        if i.contains("daniel"):
            print("whata fuckin bloatlord chad")
            return True
isBased()
                        </pre>
                    </code>
                </div>
            </div>
            
            <br/>
            <br/>

            
        </body>

        <style>
            :root {
                --shiki-color-text: #EEEEEE;
                --shiki-color-background: #333333;
                --shiki-token-constant: #660000;
                --shiki-token-string: #770000;
                --shiki-token-comment: #880000;
                --shiki-token-keyword: #990000;
                --shiki-token-parameter: #AA0000;
                --shiki-token-function: #BB0000;
                --shiki-token-string-expression: #CC0000;
                --shiki-token-punctuation: #DD0000;
                --shiki-token-link: #EE0000;
            }
            </style>
                    
        <script nonce="${nonce}" src="${scriptUri}"></script>
        
        </html>`;
        }
    }
}
TeacherWebViewprovider.viewType = 'gigo.teacherView';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=webview.js.map