import { runInThisContext } from 'vm';
import * as vscode from 'vscode';
import { Uri, Webview } from 'vscode';
import { executeAfkCheck, executeLiveCheck } from '../session/sessionUpdate';

//activateAfkWebview is called upon extension start and registers necessary commands for afk functionality
export async function activateTeacherWebView(context: vscode.ExtensionContext) {
    //register afk provider by calling class constructor
    const provider = new TeacherWebViewprovider(context.extensionUri);

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


    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {
        
        // load configuration value for afk from
        // let gigoConfig = vscode.workspace.getConfiguration("gigo");
        // this.isTutorialActive = gigoConfig.get("gigo.tutorial.on");
        
    }

    // //_getCurrentPage retrieves the number of the current page from the configfile
    // private _getCurrentPage(webview: vscode.Webview) {
    //     //get message from message hander of current page number
    //     webview.onDidReceiveMessage(
    //         async (message: any) => {
    //             const command = message.command;
    //             const text = message.text;

    //             //verify command received is currentPage and write to config file
    //             switch (command) {
    //                 case "currentPage":
    //                     try {
    //                         const fs = require('fs');
    //                         //create json formatted string
    //                         let yamlContent = `{\"currentPageNum\": ${text}}`;
    //                         //write json formatted string to config file
    //                         fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", yamlContent);
    //                         //render page with current page number as main page
    //                         if (this._view) {
    //                             this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
    //                             await this._getHtmlForWebview(this._view.webview, "");

    //                         }
    //                     } catch (err) {
    //                         console.log(err);
    //                     }
    //                     break;
    //                 case "nextGroup":
    //                     try {
    //                         if (this._view) {
    //                             this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
    //                             await this._getHtmlForWebview(this._view.webview, "next");

    //                         }

    //                     } catch (err) {
    //                         console.log(err);

    //                     }
    //                     break;
    //                 case "lastGroup":
    //                     try {
    //                         if (this._view) {
    //                             this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
    //                             await this._getHtmlForWebview(this._view.webview, "last");

    //                         }

    //                     } catch (err) {
    //                         console.log(err);

    //                     }
    //                     break;
    //                 case "startCodeTour":
    //                     try {
    //                         if (this.codeTour) {
    //                             const codeTourApi = this.codeTour.exports;
    //                             let uri = vscode.Uri.file(`${this.baseWorkspaceUri.fsPath}/.tours/tutorial-${message.text}.tour`);
    //                             codeTourApi.startTourByUri(uri);
    //                         }

    //                     } catch (err) {
    //                         console.log(err);

    //                     }
    //                     break;
    //                 case "startCodeTourStep":
    //                     try {
    //                         const step = message.step;
    //                         if (this.codeTour) {
    //                             const codeTourApi = this.codeTour.exports;
    //                             let uri = vscode.Uri.file(`${this.baseWorkspaceUri.fsPath}/.tours/tutorial-${message.text}.tour`);
    //                             try {
    //                                 await codeTourApi.endCurrentTour();
    //                             } catch (err) {}
    //                             await codeTourApi.startTourByUri(uri, 0);
    //                             await codeTourApi.startTourByUri(uri, step - 1);
    //                             // await codeTourApi.startTourByUri(uri, step - 1);
    //                             //codeTourApi.startTourByUri(uri, step - 1);
                                
    //                             //codeTourApi.endCurrentTour();
    //                         }

    //                     } catch (err) {
    //                         console.log(err);

    //                     }
    //                     break;

    //                     return;
    //             }
    //         },
    //         undefined,
    //     );
    // }


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
            // this._getCurrentPage(this._view.webview);
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
            await this._getHtml(webview, group);
        }
    }



    private getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
        return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
    }



   

    //_getAfkDisabledHtml renders page for when afk is disabled
    //takes in a group string to determine whether to render the whole page or
    //to just render the next and last group page controls
    private async _getHtml(webview: vscode.Webview, group: string) {
      


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
         
            <title>GIGO AFK Session</title>
        </head>
        
        <div id="big">
            Code Teacher is a ride along tool 
            
        </div>
        <div class="codeTeacherAnimation">
            <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>
            <lottie-player src="https://assets7.lottiefiles.com/private_files/lf30_Fy9W8c.json"  background="transparent"  speed=".6"    loop  autoplay></lottie-player>   <body>
        </div>
            <br/>
            <br/>
            
            
            <div class="dropdown">
                <button onclick="myFunction()" class="dropbtn">Dropdown⬇</button>
                <div id="myDropdown" class="dropdown-content">
                    <a href="#">Link 1</a>
                    <a href="#">Link 2</a>
                    <a href="#">Link 3</a>
                </div>
            </div> 

            <br/>
            <br/>
            <br/>
            <br/>
            
            <div class="inputs">
                <div class="input-group">
                    <label class="inputTitle">Some input</label>
                    <textarea class="inputBox" name="inputBox1" rows="10" cols="10" wrap="soft"></textarea>
                </div>
                <br/>
                <br/>
                <div class="input-group">
                    <text class="inputTitle" style="font-size: 60px;">Some input</text>
                    <textarea class="inputBox" name="inputBox2" rows="10" cols="10" wrap="soft"></textarea>
                </div>
                <br/>
                <br/>
                <div class="buttonWrapper">
                    <button class="submitButton">Fix My Code</button>
                </div>
            </div>

            <br/>
            <br/>
            <br/>
            <br/>

            <div class="outputBox">
                <label class="outputTitle">Solution</label>
                <textarea class="outputBox" name="outputBox" rows="5" cols="10" wrap="soft"></textarea>
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



function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}