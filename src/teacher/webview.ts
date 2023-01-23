import axios from 'axios';
import { runInThisContext } from 'vm';
import * as vscode from 'vscode';
import { Uri, Webview } from 'vscode';
import { executeAfkCheck, executeLiveCheck } from '../session/sessionUpdate';

//activateAfkWebview is called upon extension start and registers necessary commands for afk functionality
export async function activateTeacherWebView(context: vscode.ExtensionContext, logger: any) {
    //register afk provider by calling class constructor
    const provider = new TeacherWebViewprovider(context.extensionUri, logger);

    if (provider.codeTour){
        provider.codeTour.activate();
    }
    

    

    //push and regsitser necessary commands
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(TeacherWebViewprovider.viewType, provider));
}

//afk webview provider has basic functions for handling afk system
class TeacherWebViewprovider implements vscode.WebviewViewProvider {

    //defining local variables
    private themeConfigSection: string = 'markdown-preview-github-styles';
    private themeConfigKey: string = 'colorTheme';
    private defaultThemeConfiguration: string = 'auto';
    public tuitorialPanel!: vscode.WebviewPanel;
    public context: any;
    public toolkitUri!: vscode.Uri;
    public mainUri!: vscode.Uri;
    public baseWorkspaceUri!: vscode.Uri;
    public isTutorialActive?: boolean = true;
    public minPages = 1;
    public maxPages = 8;
    public numOfTutorials: number = 0;
    public loadingTitle: any;
    public loadingIcon: any;
    public submitButton: any;
    public inputBox1: any;
    public inputBox2: any;
    public solution: any;
    public code: any;
    public error: any;
    public solutionBox: any;
    public pageButtonsHTML = "";
    public tourSteps: any[] = [];
    public codeTour = vscode.extensions.getExtension(
        "vsls-contrib.codetour"
      );

    //defining base color pallettes
    private themeConfigValues: { [key: string]: boolean } = {
        'auto': true,
        'system': true,
        'light': true,
        'dark': true
    };
    private currentPage = 0;

    public static readonly viewType = 'gigo.teacherView';

    private _view?: vscode.WebviewView;
    public logger: any;


    constructor(
        private readonly _extensionUri: vscode.Uri,
        sysLogger: any,
    ) {

        this.logger = sysLogger;

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
        this.solutionBox = `<div hidden class="outputBox">
        <label class="outputTitle">Solution</label>
        <br/>
        <br/>
        <div class="solutionBox">
            <code class="solutionCode" name="outputBox" rows="5" cols="10" wrap="soft">
                <pre>
${this.solution}
                </pre>
            </code>
        </div>
    </div>`;
        
        // load configuration value for afk from
        // let gigoConfig = vscode.workspace.getConfiguration("gigo");
        // this.isTutorialActive = gigoConfig.get("gigo.tutorial.on");
        
    }

    //_getCurrentPage retrieves the number of the current page from the configfile
    private _getCurrentPage(webview: vscode.Webview) {
        var code: any;
        var error: any;
        //get message from message hander of current page number
        webview.onDidReceiveMessage(
            async (message: any) => {
                const command = message.command;
                const text = message.text;

                //verify command received is currentPage and write to config file
                switch (command) {
                    
                    case "loadingIcon":
                        try {
                            if (this._view) {
                                this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
                                if (message.text === "enable"){
                                    this.solutionBox = `<div hidden class="outputBox">
                                    <label class="outputTitle">Solution</label>
                                    <br/>
                                    <br/>
                                    <div class="solutionBox">
                                        <code class="solutionCode" name="outputBox" rows="5" cols="10" wrap="soft">
                                            <pre>
                            ${this.solution}
                                            </pre>
                                        </code>
                                    </div>
                                </div>`;
                                    
                                    this.loadingIcon =  `<div id="loadingAnim">
                                    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
                                    <lottie-player src="https://assets3.lottiefiles.com/packages/lf20_DVSwGQ.json"  background="transparent"  speed="1"  loop  autoplay></lottie-player>
                                    </div>`;
                                    this.submitButton =  `<div class="buttonWrapper">
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

                                    await this._getHtml(this._view.webview);
                                    this.code = message.value.code;
                                    this.error = message.value.error;
                                
                                    await this.codeRequest(message.value.code, message.value.error);
                                    this.solutionBox = `<div class="outputBox">
                                    <label class="outputTitle">Solution</label>
                                    <br/>
                                    <br/>
                                    <div class="solutionBox">
                                        <code class="solutionCode" name="outputBox" rows="5" cols="10" wrap="soft">
                                            <pre>
${this.solution}
                                            </pre>
                                        </code>
                                    </div>
                                </div>`;
                                    console.log("POST SUCCESS CALL");
                                    await this._getHtml(this._view.webview);
                                    

                                }else{
                                    this.code = "";
                                    this.error = "";
                                    this.solution = "";
                                    this.loadingIcon = `<div id="loadingAnim" style="display:none">
                                    <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
                                    <lottie-player src="https://assets3.lottiefiles.com/packages/lf20_DVSwGQ.json"  background="transparent"  speed="1"  loop  autoplay></lottie-player>
                                    </div>`;
                                    this.submitButton =  `<div class="buttonWrapper">
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
                                    this.solutionBox = `<div hidden class="outputBox">
                                    <label class="outputTitle">Solution</label>
                                    <br/>
                                    <br/>
                                    <div class="solutionBox">
                                        <code class="solutionCode" name="outputBox" rows="5" cols="10" wrap="soft">
                                            <pre>
${this.solution}
                                            </pre>
                                        </code>
                                    </div>
                                </div>`;
                                    await this._getHtml(this._view.webview);

                                }

                                console.log(this.loadingIcon);
                                
                                await this._getHtml(this._view.webview);

                            }

                        } catch (err) {
                            this.logger.error.appendLine("Code Teacher Failed: Failed to render page for loading");
                            console.log(err);

                        }
                        break;
                   
                }
            },
            undefined,
        );
    }


    //resolveWebviewView handles editor callback functions and basic html render
    public async resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {

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
    public addColor() {
        if (this._view) {
            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.postMessage({ type: 'addColor' });
        }
    }

    //clearColors sends color message to clear colors to message handler
    public clearColors() {
        if (this._view) {
            this._view.webview.postMessage({ type: 'clearColors' });
        }
    }



    //_getHtmlForWebview renders afk enbaled and disabled pages
    private async _getHtmlForWebview(webview: vscode.Webview, group: string) {
        {
            await this._getHtml(webview);
        }
    }



    private getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
        return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
    }


    public async codeRequest(code: any, error: string){

        // let http = axios.create({
        //     headers: {
        //         token: `7ffd6689-5587-4107-9457-b0f70bbd3220 `
        //     }
        // })

        axios.defaults.headers.common["token"] = `7ffd6689-5587-4107-9457-b0f70bbd3220`; 
        
          //awair result from http function in GIGO
        let res = await axios.post(
            "http://192.168.1.188:8000/api/v1/debug", 
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "code": code,
                "error": error,
                // eslint-disable-next-line @typescript-eslint/naming-convention
            }
        );

        //if non status code 200 is returned, return -1 and log failure message
        if (res.status !== 200) { 
            console.log("failed to execute live-check: ", res);
            return -1;
        }

        console.log(`response: ${res.data.response}`)
        console.log(`code res: ${res.data}`)

        this.loadingIcon = `<div id="loadingAnim" style="display:none">
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
        <lottie-player src="https://assets3.lottiefiles.com/packages/lf20_DVSwGQ.json"  background="transparent"  speed="1"  loop  autoplay></lottie-player>
        </div>`;
        this.submitButton =  `<div class="buttonWrapper">
        <button class="submitButton" onclick="submitFunc()">Fix My Code</button>
        </div>`;
        this.inputBox1 = `<div class="input-group">
        <label class="inputTitle">Code</label>
        <textarea class="inputBox" name="inputBox1" rows="10" cols="10" wrap="soft">${code}</textarea>
        </div>`;

        this.inputBox2 = `<div class="input-group">
        <text class="inputTitle">Error</text>
        <textarea class="inputBox" name="inputBox2" rows="10" cols="10" wrap="soft">${error}</textarea>
        </div>`;

        this.loadingTitle = `<div hidden class="loadingTitle"><text class="loadingText">Your code is being processed by a bot.\nRemeber copying code is only based if you understand it.</text></div>`;

        this.solution = res.data.response;
    }


   

    //_getAfkDisabledHtml renders page for when afk is disabled
    //takes in a group string to determine whether to render the whole page or
    //to just render the next and last group page controls
    private async _getHtml(webview: vscode.Webview) {
      
        

         // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
         const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'teacher', 'buttons_teacher.js'));

         // Do the same for the stylesheet.
         const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'afk', 'reset_afk.css'));
         const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'afk', 'vscode_afk.css'));
         const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'teacher', 'main_teacher.css'));
       
           
        
        // Use a nonce to only allow a specific script to be run.
        const nonce = getNonce();
        
//         let solution = `
// import chad-lang
// import os

// def isBased():
//     for i in os.opendir("/daniel-gym-photos/):
//         if i.contains("daniel"):
//             print("whata fuckin bloatlord chad")
//             return True
// isBased()`
            let solutionPre = `
${this.solution}
`
        

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

            
            
            ${this.solutionBox}
            
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



function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}