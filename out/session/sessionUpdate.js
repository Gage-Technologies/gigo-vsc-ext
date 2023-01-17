"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAfkCheck = exports.executeLiveCheck = exports.activateTimeout = exports.userHasBeenActive = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
exports.userHasBeenActive = false;
let nextTimeStamp = (Date.now() / 1000) + (10 * 60);
let isAFK = false;
//activateTimeout is called when the extension is activated
async function activateTimeout(context) {
    // link callbacks for tracking user activity
    checkUserActivity();
    //core loop iterates until user is inactive for a set amount of time
    while (true) {
        //interior loop iterates until a sepcified time is remaining before the use is dtermined to be inactive
        while (true) {
            //if the user is afk wait 1 second before checking again
            if (!isAFK) {
                //determine time remaining before user is considered inactive
                let currentTimeRemaining = nextTimeStamp - (Date.now() / 1000);
                //if user has less than or equal to 3 minutes remaining break from loop 
                if (currentTimeRemaining <= 180) {
                    break;
                }
            }
            //wait 1 second before iterating again
            await new Promise(f => setTimeout(f, 1000));
        }
        //prompt user that with inactive pop-up and display time remaining before session timeout
        let isRenewed = (await renewPopup()).valueOf();
        //if the user is not afk and is still inactive terminate the session
        if (!isRenewed && !isAFK) {
            vscode.window.showInformationMessage("Session is being terminated due to inactivity");
            break;
        }
        //if user is not afk but is active call live check to renew session timer
        await executeLiveCheck("7311fb2a-f09b-4575-9ca2-254f7cbfeda6", "cd68f3ed9b605731d2cae49a41eeaf405e4a9d37b74c2a1e8f1ad08cc58a17ee");
    }
}
exports.activateTimeout = activateTimeout;
//renewPopup will continously displaya popup every minute prompting the user to renew session or session will end
async function renewPopup() {
    //determine time remaining
    let timeRemaining = nextTimeStamp - (Date.now() / 1000);
    let isRenewed = false;
    //if the user has not renewed the session and there is time remaining continue looping
    while (!isRenewed && timeRemaining > 0) {
        //if the user has been active display welcome back message, break from loop, and return true
        if (exports.userHasBeenActive) {
            vscode.window.showInformationMessage("Welcome back");
            isRenewed = true;
            return true;
        }
        //if the user has not been active diplay 'are you still there' message
        vscode.window.showInformationMessage(`Are you still there?\n    session will auto close in ${Math.round(timeRemaining / 60)} minutes`, "Continue session").then(selection => {
            //if user clicks continue button display welcome message, break from loop, and return true
            vscode.window.showInformationMessage("Welcome back");
            isRenewed = true;
            return true;
        });
        //wait for 1 minute before checking again
        await new Promise(f => setTimeout(f, 60000));
        //reduce time remaining by 1 minute
        timeRemaining = timeRemaining - 60;
    }
    //time remaining is 0 and user has not been active, return false
    return false;
}
//executeLiveCheck will execute a live check to renew session timer by calling http function in GIGO
async function executeLiveCheck(wsID, secret) {
    //await result from http function in GIGO
    let res = await axios_1.default.post("http://gigo.gage.intranet/api/internal/ws/live-check", {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "coder_id": wsID,
        "secret": secret
    });
    //if non status code 200 is returned, return -1 and log failure message
    if (res.status !== 200) {
        console.log("failed to execute live-check: ", res);
        return -1;
    }
    //set next timeout to timestamp retrieved from http call
    nextTimeStamp = res.data.expiration;
}
exports.executeLiveCheck = executeLiveCheck;
//executeAfkCheck will execute a call to get an afk session timestamp from the http function in GIGO
async function executeAfkCheck(wsID, secret, addMin) {
    //awair result from http function in GIGO
    let res = await axios_1.default.post("http://gigo.gage.intranet/api/internal/ws/afk", {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "coder_id": wsID,
        "secret": secret,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "add_min": addMin
    });
    //if non status code 200 is returned, return -1 and log failure message
    if (res.status !== 200) {
        console.log("failed to execute live-check: ", res);
        return -1;
    }
    //set afk variable to true
    isAFK = true;
    //return afk timestamp
    return res.data.expiration;
}
exports.executeAfkCheck = executeAfkCheck;
//activityCallback is called upon user interaction and sets states to user active
function activityCallback() {
    if (!exports.userHasBeenActive) {
        vscode.window.showInformationMessage("Welcome back");
    }
    //set user active to true
    exports.userHasBeenActive = true;
    if (isAFK) {
        //execute disable afk command
        vscode.commands.executeCommand("gigo.disableAFK");
        vscode.window.showInformationMessage("Welcome back");
    }
    //set is afk to false
    isAFK = false;
}
//checkUserActivity is a callback funtion that occurs whenever a user does a recognizable input
function checkUserActivity() {
    //all callback functions call activityCallback on registered input
    vscode.window.onDidChangeActiveTerminal(activityCallback);
    vscode.window.onDidChangeActiveTextEditor(activityCallback);
    vscode.window.onDidChangeTerminalState(activityCallback);
    vscode.window.onDidCloseTerminal(activityCallback);
    vscode.window.onDidOpenTerminal(activityCallback);
    vscode.window.onDidChangeTextEditorOptions(activityCallback);
    vscode.window.onDidChangeTextEditorSelection(activityCallback);
    vscode.window.onDidChangeTextEditorViewColumn(activityCallback);
    vscode.window.onDidChangeTextEditorVisibleRanges(activityCallback);
    vscode.window.onDidChangeVisibleTextEditors(activityCallback);
    // vscode.window.onDidChangeWindowState(activityCallback);
    // vscode.workspace.onDidChangeTextDocument(activityCallback);
    // vscode.workspace.onDidCloseTextDocument(activityCallback);
    // vscode.workspace.onDidOpenTextDocument(activityCallback);
    vscode.workspace.onDidChangeNotebookDocument(activityCallback);
    vscode.workspace.onDidCloseNotebookDocument(activityCallback);
    vscode.workspace.onDidOpenNotebookDocument(activityCallback);
    vscode.workspace.onDidCreateFiles(activityCallback);
    vscode.workspace.onDidDeleteFiles(activityCallback);
}
//# sourceMappingURL=sessionUpdate.js.map