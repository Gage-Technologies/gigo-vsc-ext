"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userHasBeenActive = void 0;
const vscode = require("vscode");
const fetch = require('node-fetch');
exports.userHasBeenActive = false;
function checkUserActivity() {
    vscode.window.onDidChangeActiveTerminal(() => {
        console.log(1);
        exports.userHasBeenActive = true;
    });
    vscode.window.onDidChangeActiveTextEditor(() => {
        console.log(2);
        exports.userHasBeenActive = true;
    });
    vscode.window.onDidChangeTerminalState(() => {
        console.log(3);
        exports.userHasBeenActive = true;
    });
    vscode.window.onDidCloseTerminal(() => {
        console.log(4);
        exports.userHasBeenActive = true;
    });
    vscode.window.onDidOpenTerminal(() => {
        console.log(5);
        exports.userHasBeenActive = true;
    });
    vscode.window.onDidChangeTextEditorOptions(() => {
        console.log(6);
        exports.userHasBeenActive = true;
    });
    vscode.window.onDidChangeTextEditorSelection(() => {
        console.log(7);
        exports.userHasBeenActive = true;
    });
    vscode.window.onDidChangeTextEditorViewColumn(() => {
        console.log(8);
        exports.userHasBeenActive = true;
    });
    vscode.window.onDidChangeTextEditorVisibleRanges(() => {
        console.log(9);
        exports.userHasBeenActive = true;
    });
    vscode.window.onDidChangeVisibleTextEditors(() => {
        console.log(10);
        exports.userHasBeenActive = true;
    });
    vscode.window.onDidChangeWindowState(() => {
        console.log(11);
        exports.userHasBeenActive = true;
    });
    vscode.workspace.onDidChangeTextDocument(() => {
        console.log(12);
        exports.userHasBeenActive = true;
    });
    vscode.workspace.onDidCloseTextDocument(() => {
        console.log(13);
        exports.userHasBeenActive = true;
    });
    // vscode.workspace.onDidOpenTextDocument(() =>{
    //     console.log(14)
    //     userHasBeenActive = true;
    // });
    vscode.workspace.onDidChangeNotebookDocument(() => {
        console.log(15);
        exports.userHasBeenActive = true;
    });
    vscode.workspace.onDidCloseNotebookDocument(() => {
        console.log(16);
        exports.userHasBeenActive = true;
    });
    vscode.workspace.onDidOpenNotebookDocument(() => {
        console.log(17);
        exports.userHasBeenActive = true;
    });
    vscode.workspace.onDidCreateFiles(() => {
        console.log(18);
        exports.userHasBeenActive = true;
    });
    vscode.workspace.onDidDeleteFiles(() => {
        console.log(19);
        exports.userHasBeenActive = true;
    });
}
//# sourceMappingURL=callback.js.map