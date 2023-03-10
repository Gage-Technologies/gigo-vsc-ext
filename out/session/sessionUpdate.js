"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeAfkCheck = exports.executeLiveCheck = exports.activateTimeout = exports.userHasBeenActive = void 0;
const vscode = require("vscode");
const axios_1 = require("axios");
exports.userHasBeenActive = false;
let nextTimeStamp = (Date.now() / 1000) + (10 * 60);
let isAFK = false;
var logger;
//activateTimeout is called when the extension is activated
async function activateTimeout(context, cfg, sysLogger) {
    logger = sysLogger;
    // link callbacks for tracking user activity
    checkUserActivity();
    // retry initial live check every 5 minutes until we hit or timeout 10 minutes later
    while (true) {
        //if user is not afk but is active call live check to renew session timer
        let res = await executeLiveCheck(cfg.workspace_id_string, cfg.secret);
        console.log(`INIT LIVE CHECK COMPLETED: ${nextTimeStamp}`);
        if (res === -1) {
            logger.info.appendLine("Session: Disconnected from GIGO servers.");
            vscode.window.showInformationMessage("We are unable to connect to GIGO servers. Please check your network connection.");
            await new Promise(f => setTimeout(f, 5000));
            continue;
        }
        // update next timestamp
        nextTimeStamp = res;
        break;
    }
    //core loop iterates until user is inactive for a set amount of time
    while (true) {
        //interior loop iterates until a sepcified time is remaining before the use is dtermined to be inactive
        while (true) {
            //if the user is afk wait 100ms before checking again
            if (!isAFK) {
                // logger.info.appendLine("Session: User is not afk, time remaining: " + (nextTimeStamp - (Date.now()/1000)));
                // console.log("checking if we go time remaining: " + (nextTimeStamp - (Date.now()/1000)));
                //determine time remaining before user is considered inactive
                let currentTimeRemaining = nextTimeStamp - (Date.now() / 1000);
                //if user has less than or equal to 3 minutes remaining break from loop 
                // if (currentTimeRemaining <= 180){
                //     break;
                // }
                if (currentTimeRemaining <= 180) {
                    console.log("checking activity");
                    break;
                }
            }
            //wait 100ms before iterating again
            await new Promise(f => setTimeout(f, 100));
        }
        console.log("calling renewpopup");
        //prompt user that with inactive pop-up and display time remaining before session timeout
        let isRenewed = (await renewPopup()).valueOf();
        console.log(`isRenewed: ${isRenewed}`);
        //if the user is not afk and is still inactive terminate the session
        if (!isRenewed && !isAFK) {
            logger.info.appendLine("Session: Session is being terminated due to inactivity.");
            vscode.window.showInformationMessage("Session is being terminated due to inactivity");
            break;
        }
        console.log("CALLING LIVE CHECK");
        logger.info.appendLine(`Session: Calling live check user is afk: ${isAFK}  user is active: ${isRenewed}  time remaining: ${(nextTimeStamp - (Date.now() / 1000)) / 60}`);
        //if user is not afk but is active call live check to renew session timer
        let res = await executeLiveCheck(cfg.workspace_id_string, cfg.secret);
        console.log(`LIVE CHECK COMPLETED: ${nextTimeStamp}`);
        if (res === -1) {
            logger.info.appendLine("Session: Disconnected from GIGO servers.");
            vscode.window.showInformationMessage("We are unable to connect to GIGO servers. Please check your network connection.");
            await new Promise(f => setTimeout(f, 500));
            continue;
        }
        // update next timestamp
        nextTimeStamp = res;
        exports.userHasBeenActive = false;
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
            logger.info.appendLine("Session: User is active.");
            // // vscode.window.showInformationMessage("Welcome back");
            isRenewed = true;
            console.log("setting renewed status inside conditional: ", isRenewed);
            return true;
        }
        //if the user has not been active dip1674382421ay 'are you still there' message
        vscode.window.showInformationMessage(`Are you still there?\n    session will auto close in ${Math.round(timeRemaining / 60)} minutes`, "Continue session").then(selection => {
            //if user clicks continue button display welcome message, break from loop, and return true
            vscode.window.showInformationMessage("Welcome back");
            logger.info.appendLine("Session: User is active.");
            isRenewed = true;
            console.log("setting renewed status inside popup: ", isRenewed);
            return true;
        });
        //wait for 1 minute before checking again
        await new Promise(f => setTimeout(f, 60000));
        //reduce time remaining by 1 minute
        timeRemaining = timeRemaining - 60;
    }
    if (isRenewed) {
        console.log("renewed varibale setb outside function");
        vscode.window.showInformationMessage("Welcome back");
        return true;
    }
    //time remaining is 0 and user has not been active, return false
    return false;
}
//executeLiveCheck will execute a live check to renew session timer by calling http function in GIGO
async function executeLiveCheck(wsID, secret) {
    let expiration = -1;
    isAFK = false;
    for (let i = 0; i < 3; i++) {
        try {
            //await result from http function in GIGO
            let res = await axios_1.default.post("http://gigo.gage.intranet/internal/v1/ext/live-check", {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "workspace_id": wsID,
                "secret": secret
            });
            expiration = res.data.expiration;
            break;
        }
        catch (e) {
            logger.error.appendLine(`Session Failed: Failed to retrieve result from live check: ${e}.`);
            await new Promise(f => setTimeout(f, 300));
            continue;
        }
    }
    logger.info.appendLine(`Session: Result from live check: ${expiration}.`);
    return expiration;
}
exports.executeLiveCheck = executeLiveCheck;
//executeAfkCheck will execute a call to get an afk session timestamp from the http function in GIGO
async function executeAfkCheck(wsID, secret, addMin) {
    var res;
    for (let i = 0; i < 3; i++) {
        try {
            //awair result from http function in GIGO
            let res = await axios_1.default.post("http://gigo.gage.intranet/internal/v1/ext/afk", {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "workspace_id": wsID,
                "secret": secret,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                "add_min": addMin
            });
            logger.info.appendLine(`Session: Result from afk check: ${res.data.expiration}.`);
            //if non status code 200 is returned, return -1 and log failure message
            // if (res.status !== 200) { 
            //     errors.appendLine(`failed to executeAfkCheck: ${res}`);
            //     return -1;;
            // }
            //set afk variable to true
            isAFK = true;
            //return afk timestamp
            return res.data.expiration;
        }
        catch (e) {
            logger.error.appendLine(`Session Failed: Failed to retrieve result from afk check: ${e}.`);
            await new Promise(f => setTimeout(f, 1000));
            continue;
        }
        break;
    }
    try {
        console.log(`afk result: ${res.data.expiration}`);
        if (res.data.expiration <= 0) {
            logger.error.appendLine(`Session Failed: Failed to retrieve result from afk check: no result found.`);
            isAFK = false;
            return -1;
        }
    }
    catch (e) {
        logger.error.appendLine(`Session Failed: Failed to retrieve result from afk check: ${e}.`);
        isAFK = false;
        return -1;
    }
}
exports.executeAfkCheck = executeAfkCheck;
//activityCallback is called upon user interaction and sets states to user active
function activityCallback() {
    if (!exports.userHasBeenActive) {
        console.log("activity registered at ", Date.now());
        vscode.window.showInformationMessage("Welcome back");
        logger.info.appendLine("Session: User is active.");
    }
    // vscode.window.showInformationMessage("activity logged");
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
    // vscode.window.onDidChangeTextEditorVisibleRanges(activityCallback);
    vscode.window.onDidChangeVisibleTextEditors(activityCallback);
    //TODO
    // vscode.window.onDidChangeWindowState(activityCallback);
    // vscode.workspace.onDidChangeTextDocument(activityCallback);
    // vscode.workspace.onDidCloseTextDocument(activityCallback);
    // vscode.workspace.onDidOpenTextDocument(activityCallback);
    //TODO
    vscode.workspace.onDidChangeNotebookDocument(activityCallback);
    vscode.workspace.onDidCloseNotebookDocument(activityCallback);
    vscode.workspace.onDidOpenNotebookDocument(activityCallback);
    vscode.workspace.onDidCreateFiles(activityCallback);
    vscode.workspace.onDidDeleteFiles(activityCallback);
}
//# sourceMappingURL=sessionUpdate.js.map