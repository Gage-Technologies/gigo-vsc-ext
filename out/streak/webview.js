"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateStreakWebView = void 0;
const axios_1 = require("axios");
const vscode = require("vscode");
const vscode_1 = require("vscode");
const eplosion_webview_1 = require("./eplosion_webview");
var messageData;
//activateAfkWebview is called upon extension start and registers necessary commands for afk functionality
async function activateStreakWebView(context, cfg, logger) {
    //register afk provider by calling class constructor
    const provider = new StreakWebViewprovider(context.extensionUri, logger);
    // let res = await provider.executeStreakCheck(cfg.workspace_id_string, cfg.secret);
    // console.log(res);
    logger.info.appendLine("Streak: starting streak websocket");
    provider.websocketStreakCheck(cfg.workspace_id_string, cfg.secret);
    provider.renewStats();
    //push and regsitser necessary commands
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(StreakWebViewprovider.viewType, provider));
}
exports.activateStreakWebView = activateStreakWebView;
//afk webview provider has basic functions for handling afk system
class StreakWebViewprovider {
    constructor(_extensionUri, sysLogger) {
        this._extensionUri = _extensionUri;
        this.decorations = [];
        this.activeDaysHTML = `
    <div class="weekday"><span>M</span></div>
    <div class="separator">-</div>
    <div class="weekday"><span>T</span></div>
    <div class="separator">-</div>
    <div class="weekday"><span>W</span></div>
    <div class="separator">-</div>
    <div class="weekday"><span>T</span></div>
    <div class="separator">-</div>
    <div class="weekday"><span>F</span></div>
    <div class="separator">-</div>
    <div class="weekday"><span>S</span></div>
    <div class="separator">-</div>
    <div class="weekday"><span>S</span></div>`;
        this.weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        this.isOnFire = false;
        this.dayOfTheWeek = "";
        this.logger = sysLogger;
        // this.activeDays = [1,2];
        this.streakAnim = `<div class="streakAnim">
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script> 
        <lottie-player src="https://lottie.host/6a43c37a-8fb7-43e8-adcb-1a650a039733/NwYos3Ht64.json" background="transparent" speed="1"  loop autoplay></lottie-player>
        </div>`;
        // load configuration value for afk from
        let gigoConfig = vscode.workspace.getConfiguration("gigo");
        // activateFireAnimation(this.context, 100);
    }
    // checking websocket connection to recieve information from messages
    websocketStreakCheck(wsID, secret) {
        // establish new websocket client
        var WebSocketClient = require('websocket').client;
        var client = new WebSocketClient();
        // handle if client connection fails
        client.on('connectFailed', function (error) {
            console.log('Connect Error: ' + error.toString());
        });
        let logger = this.logger;
        logger.info.appendLine("Streak: inside streak websocket");
        // handle websocket connection 
        client.on('connect', function (connection) {
            console.log('WebSocket Client Connected');
            logger.info.appendLine('WebSocket Client Connected');
            connection.on('error', function (error) {
                console.log("Connection Error: " + error.toString());
                logger.error.appendLine("Connection Error: " + error.toString());
            });
            connection.on('close', function () {
                console.log('echo-protocol Connection Closed');
                logger.error.appendLine('echo-protocol Connection Closed');
            });
            connection.on('message', function (message) {
                if (message.type === 'utf8') {
                    if (message.utf8Data === "PING") {
                        client.send("PONG");
                    }
                    console.log("Received: '" + message.utf8Data + "'");
                    logger.info.appendLine("Received: '" + message.utf8Data + "'");
                    if (message.utf8Data !== 'Socket connected successfully') {
                        try {
                            messageData = JSON.parse(message.utf8Data);
                        }
                        catch (err) {
                            console.log(message.utf8Data);
                            console.log("Streak: failed to parse message intio json, err: ", err, " message: ", message.utf8Data);
                        }
                    }
                }
            });
        });
        logger.info.appendLine("Streak: calling websocket");
        client.connect(`wss://api.gigo.dev/internal/v1/ext/streak-check/${wsID}/${secret}`);
    }
    // checks every minute to handle any stat changes 
    async renewStats() {
        while (true) {
            console.log("display explode");
            //this.explode(vscode.window.activeTextEditor, false);
            console.log("past explode");
            // update stats with the message recieved from websocket
            try {
                let wasFire = this.isOnFire;
                this.isOnFire = messageData.streak_active;
                this.activeDays = messageData.week_in_review;
                this.streakNum = messageData.current_streak;
                this.dayOfTheWeek = messageData.current_day_of_week;
                // if user currently has an active streak and hit the mark to keep it going, trigger explosion
                if (!wasFire && this.isOnFire) {
                    console.log("displaying notification streak wasFire: ", wasFire, " isOnFire: ", this.isOnFire);
                    (0, eplosion_webview_1.activateFireAnimation)(this.context, this.streakNum);
                    //this.explode(vscode.window.activeTextEditor, false);
                }
                // update user's streak stats
                console.log("Streak: set params{ isOnFire: ", messageData.streak_active, " weekInReview: ", messageData.week_in_review, " streakNum: ", messageData.current_streak, " current day of week: ", messageData.current_day_of_week);
                if (this._view) {
                    if (this._view.visible) {
                        this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
                        //this._getCurrentPage(this._view.webview);
                        await this._getHtmlForWebview(this._view.webview, "");
                    }
                }
            }
            catch (err) {
                console.log("Streak: failed to set variables from message, err: ", err);
            }
            //wait for 1 second before checking again
            await new Promise(f => setTimeout(f, 1000));
        }
    }
    //executeAfkCheck will execute a call to get an afk session timestamp from the http function in GIGO
    async executeStreakCheck(wsID, secret) {
        //await result from http function in GIGO
        let res = await axios_1.default.post("https://api.gigo.dev/internal/v1/ext/streak-check", {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "workspace_id": wsID,
            "secret": secret,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            // "owner_id": ownerID,
        });
        //if non status code 200 is returned, return -1 and log failure message
        if (res.status !== 200) {
            console.log("failed to execute live-check: ", res);
            return -1;
        }
        // display result to console
        console.log(JSON.stringify(res));
        // append the result to the logger
        this.logger.info.appendLine(JSON.stringify(res));
        // display the result in the VS Code editor
        vscode.window.showInformationMessage(`${JSON.stringify(res)}`);
        // assign variables to corresponding result variables
        this.isOnFire = res.data.is_on_fire;
        this.activeDays = res.data.streak_week_days;
        this.streakNum = res.data.current_streak_num;
        return;
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
            await this._getHtml(webview, group);
        }
    }
    getUri(webview, extensionUri, pathList) {
        return webview.asWebviewUri(vscode_1.Uri.joinPath(extensionUri, ...pathList));
    }
    //_getAfkDisabledHtml renders page for when afk is disabled
    //takes in a group string to determine whether to render the whole page or
    //to just render the next and last group page controls
    async _getHtml(webview, group) {
        var streakNumHtml = `<span class="noStreak">
            No Current Streak
            </span>`;
        if (this.streakNum !== undefined && this.streakNum > 0) {
            var streakNumHtml = `<span class="streakNumber">
                ${this.streakNum}
                </span>`;
        }
        // displays fire animation for an active streak
        if (this.isOnFire) {
            if (this.streakNum !== undefined && this.streakNum > 0) {
                this.streakAnim = `<div class="streakAnimOnFire">
                <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script> 
                <lottie-player src="https://lottie.host/943c92a4-fc4d-42d7-b9f5-fd5f2f2783bd/PgLfoB1v2G.json" background="transparent" speed="1" loop autoplay></lottie-player>
                </div>`;
                streakNumHtml = `<span class="streakNumberOnFire">
                            ${this.streakNum}
                           
                            </span>`;
            }
        }
        console.log("Streak: active days: ", this.activeDays);
        // checks for the users active days where a streak was continued and displays accordingly 
        if (this.activeDays) {
            this.activeDaysHTML = ``;
            console.log("this day of the week: ", this.dayOfTheWeek);
            for (let day in this.weekDays) {
                let dayString = this.weekDays[day];
                console.log("Streak iter day initial: ", dayString);
                console.log("Streak iterating iter day : ", dayString, " streak active value: ", this.activeDays[dayString]);
                if (this.dayOfTheWeek === dayString) {
                    console.log("Streak iter on today: ", dayString);
                    if (this.activeDays[dayString]) {
                        this.activeDaysHTML += `<div class="weekday weekdayActive"><span>${dayString.charAt(0)}</span></div>`;
                    }
                    else {
                        this.activeDaysHTML += `<div class="weekday weekdayToday"><span>${dayString.charAt(0)}</span></div>`;
                    }
                    if (dayString !== "Sunday") {
                        this.activeDaysHTML += `<div class="separator">-</div>`;
                    }
                }
                else {
                    if (this.activeDays[dayString]) {
                        this.activeDaysHTML += `<div class="weekday weekdayActive"><span>${dayString.charAt(0)}</span></div>`;
                    }
                    else {
                        this.activeDaysHTML += `<div class="weekday"><span>${dayString.charAt(0)}</span></div>`;
                    }
                    if (dayString !== "Sunday") {
                        if (this.activeDays[dayString]) {
                            this.activeDaysHTML += `<div class="separator separatorActive">-</div>`;
                        }
                        else {
                            this.activeDaysHTML += `<div class="separator">-</div>`;
                        }
                    }
                }
            }
            console.log("Streak week html: ", this.activeDaysHTML);
        }
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
        // const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'teacher', 'buttons_teacher.js'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'streak', 'main_streak.css'));
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
                
                    ${streakNumHtml}
                        
                        
                </div>
                <br/>
                <br/>
                <div class="streakWeekBox">
                    <span class="streakWeekText">Week In Review</span>
                    <br/>
                    <br/>
                    <div class="weekdays" >
                        ${this.activeDaysHTML}
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
                    
           
			</html>`;
        }
    }
}
StreakWebViewprovider.viewType = 'gigo.streakView';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=webview.js.map