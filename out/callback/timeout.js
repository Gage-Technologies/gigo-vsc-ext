"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activateTimeout = void 0;
const vscode = require("vscode");
const fetch = require('node-fetch');
let nextTimeStamp = (Date.now() / 1000) + (30 * 60);
let userHasBeenActive = false;
async function activateTimeout(context) {
    checkUserActivity();
    console.log((await renewPopup()).valueOf());
    while (true) {
        while (true) {
            let currentTimeRemaining = nextTimeStamp - (Date.now() / 1000);
            if (currentTimeRemaining <= 180) {
                break;
            }
            await new Promise(f => setTimeout(f, 1000));
        }
        let isRenewed = (await renewPopup()).valueOf();
        if (!isRenewed) {
            vscode.window.showInformationMessage("Session is being terminated due to inactivity");
            break;
            ///TODO send kill command
        }
        let res = await refreshRoutine("7311fb2a-f09b-4575-9ca2-254f7cbfeda6", "cd68f3ed9b605731d2cae49a41eeaf405e4a9d37b74c2a1e8f1ad08cc58a17ee");
        console.log(res);
    }
    //renewPopup();
}
exports.activateTimeout = activateTimeout;
function checkUserActivity() {
    vscode.window.onDidChangeActiveTerminal(() => {
        console.log(1);
        userHasBeenActive = true;
    });
    vscode.window.onDidChangeActiveTextEditor(() => {
        console.log(2);
        userHasBeenActive = true;
    });
    vscode.window.onDidChangeTerminalState(() => {
        console.log(3);
        userHasBeenActive = true;
    });
    vscode.window.onDidCloseTerminal(() => {
        console.log(4);
        userHasBeenActive = true;
    });
    vscode.window.onDidOpenTerminal(() => {
        console.log(5);
        userHasBeenActive = true;
    });
    vscode.window.onDidChangeTextEditorOptions(() => {
        console.log(6);
        userHasBeenActive = true;
    });
    vscode.window.onDidChangeTextEditorSelection(() => {
        console.log(7);
        userHasBeenActive = true;
    });
    vscode.window.onDidChangeTextEditorViewColumn(() => {
        console.log(8);
        userHasBeenActive = true;
    });
    vscode.window.onDidChangeTextEditorVisibleRanges(() => {
        console.log(9);
        userHasBeenActive = true;
    });
    vscode.window.onDidChangeVisibleTextEditors(() => {
        console.log(10);
        userHasBeenActive = true;
    });
    vscode.window.onDidChangeWindowState(() => {
        console.log(11);
        userHasBeenActive = true;
    });
    vscode.workspace.onDidChangeTextDocument(() => {
        console.log(12);
        userHasBeenActive = true;
    });
    vscode.workspace.onDidCloseTextDocument(() => {
        console.log(13);
        userHasBeenActive = true;
    });
    // vscode.workspace.onDidOpenTextDocument(() =>{
    //     console.log(14)
    //     userHasBeenActive = true;
    // });
    vscode.workspace.onDidChangeNotebookDocument(() => {
        console.log(15);
        userHasBeenActive = true;
    });
    vscode.workspace.onDidCloseNotebookDocument(() => {
        console.log(16);
        userHasBeenActive = true;
    });
    vscode.workspace.onDidOpenNotebookDocument(() => {
        console.log(17);
        userHasBeenActive = true;
    });
    vscode.workspace.onDidCreateFiles(() => {
        console.log(18);
        userHasBeenActive = true;
    });
    vscode.workspace.onDidDeleteFiles(() => {
        console.log(19);
        userHasBeenActive = true;
    });
}
function afkButton() {
    let afkIcon = new vscode.ThemeIcon("$(stop");
}
async function renewPopup() {
    let timeRemaining = nextTimeStamp - (Date.now() / 1000);
    let isRenewed = false;
    while (!isRenewed && timeRemaining > 0) {
        console.log("user been active: " + userHasBeenActive);
        if (userHasBeenActive) {
            vscode.window.showInformationMessage("Welcome back");
            isRenewed = true;
            return true;
        }
        vscode.window.showInformationMessage(`Are you still there?\n    session will auto close in ${Math.round(timeRemaining / 60)} minutes`, "Continue session").then(selection => {
            vscode.window.showInformationMessage("Welcome back");
            isRenewed = true;
            return true;
        });
        await new Promise(f => setTimeout(f, 1000));
        timeRemaining = timeRemaining - 60;
    }
    return false;
}
async function refreshRoutine(wsID, secret) {
    let res = await fetch("http://gigo.gage.intranet/api/internal/ws/live-check", {
        method: 'POST',
        body: JSON.stringify({
            "coder_id": wsID,
            "secret": secret
        }),
        headers: { "Content-Type": "application/json" }
    });
    if (!res.ok) {
        console.log("failed to execute live-check: ", res);
        return -1;
    }
    console.log("response print: ", res);
    let jRes = await res.json();
    console.log("json print: ", jRes);
    return jRes["expiration"];
}
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=timeout.js.map