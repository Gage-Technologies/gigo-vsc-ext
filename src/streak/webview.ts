import axios from 'axios';
import { runInThisContext } from 'vm';
import * as vscode from 'vscode';
import { Uri, Webview } from 'vscode';
import { executeAfkCheck, executeLiveCheck } from '../session/sessionUpdate';


//activateAfkWebview is called upon extension start and registers necessary commands for afk functionality
export async function activateStreakWebView(context: vscode.ExtensionContext) {
    //register afk provider by calling class constructor
    const provider = new StreakWebViewprovider(context.extensionUri);


    

    //push and regsitser necessary commands
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(StreakWebViewprovider.viewType, provider));
}

//afk webview provider has basic functions for handling afk system
class StreakWebViewprovider implements vscode.WebviewViewProvider {

    //defining local variables
    public tuitorialPanel!: vscode.WebviewPanel;
    public context: any;
    public toolkitUri!: vscode.Uri;
    public mainUri!: vscode.Uri;
    public baseWorkspaceUri!: vscode.Uri;

    public streakAnim: any;
    public streakNum: any;

    public activeDays: number[] = []
    public isOnFire: boolean = false;
   

    public static readonly viewType = 'gigo.streakView';

    private _view?: vscode.WebviewView;

  

    constructor(
        private readonly _extensionUri: vscode.Uri,
    ) {

        this.activeDays = [1,2]

        this.streakAnim = `<div class="streakAnim">
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script> 
        <lottie-player src="https://lottie.host/6a43c37a-8fb7-43e8-adcb-1a650a039733/NwYos3Ht64.json" background="transparent" speed="1"  loop autoplay></lottie-player>
        </div>`;
        // load configuration value for afk from
        let gigoConfig = vscode.workspace.getConfiguration("gigo");
        
        
    }

    //executeAfkCheck will execute a call to get an afk session timestamp from the http function in GIGO
    public async executeStreakCheck(wsID: any, secret: any, ownerID: any){
        //awair result from http function in GIGO
        let res = await axios.post(
            "http://gigo.gage.intranet/api/internal/ws/afk", 
            {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "coder_id": wsID,
                "secret": secret,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "owner_id": ownerID,

            }
        );

        //if non status code 200 is returned, return -1 and log failure message
        if (res.status !== 200) { 
            console.log("failed to execute live-check: ", res);
            return -1;
        }

        this.isOnFire = res.data.is_on_fire;
        this.activeDays = res.data.streak_week_days;
        this.streakNum = res.data.current_streak_num;
        
        return; 
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
    // main.css
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
            //this._getCurrentPage(this._view.webview);
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

            if (this.isOnFire){
                this.streakAnim = `<div class="streakAnimOnFire">
                <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script> 
                <lottie-player src="https://lottie.host/943c92a4-fc4d-42d7-b9f5-fd5f2f2783bd/PgLfoB1v2G.json" background="transparent" speed="1" loop autoplay></lottie-player>
                </div>`;
            }


            // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
            const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'tutorial', 'media', 'buttons.js'));
            const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'streak', 'media', 'main.css'));
            const fireIcon = vscode.Uri.joinPath(this._extensionUri, 'src', 'streak', 'media', 'fire-svgrepo-com.svg');

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
				
                <link href="${styleMainUri}" rel="stylesheet">
				<title>GIGO Streak</title>
                
			</head>
                <p>
                    <span class="bigger">Streaks are recorded every day when the user has reached 30 minutes of activity.</span>
                </p>
                <br/>
                <br/>
			<body>
                <br/>
                <br/>
                <div class="streakBox">
                    <span class="streakText">Current Streak</span>

                    




                    

                    
                    ${this.streakAnim}
                
                    <span class="streakNumber">
                        190
                       
                    </span>
                        
                        
                </div>
                <br/>
                <br/>
                <div class="streakWeekBox">
                    <span class="streakWeekText">Week In Review</span>
                    <br/>
                    <br/>
                    <div class="weekdays" >
                        <div class="weekday"><span>M</span></div>
                        <div class="separator">-</div>
                        <div class="weekday weekdayActive"><span>T</span></div>
                        <div class="separator separatorActive">-</div>
                        <div class="weekday  weekdayActive"><span>W</span></div>
                        <div class="separator">-</div>
                        <div class="weekday"><span>T</span></div>
                        <div class="separator">-</div>
                        <div class="weekday weekdayActive"><span>F</span></div>
                        <div class="separator">-</div>
                        <div class="weekday weekdayToday"><span>S</span></div>
                        <div class="separator">-</div>
                        <div class="weekday"><span>S</span></div>
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






function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}