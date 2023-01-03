
'use strict';
import * as vscode from 'vscode';
import { HelloWorldPanel } from './helloWorld';
import Tutorial from './tutorial/tutorial';
import AutoGit from './vcs/auto-git';
// import {activateTimeout} from './callback/timeout';
import { activateAfkWebView } from './afk/webview';
import { activateTimeout } from './session/sessionUpdate';
import { activateTutorialWebView } from './tutorial/webview';

let autoGit: AutoGit;
let tutorial: Tutorial;

//activate function registers all listed commands and initializes some classes on startup
export function activate(context: vscode.ExtensionContext) {
    //registser autoGit command using its local activation function
    autoGit = new AutoGit();
    autoGit.activate(context);

    //start tutorial using its local activation function
    tutorial = new Tutorial(context);
    activateTimeout(context);

    //start afk using its local activation function
    activateAfkWebView(context);

    activateTutorialWebView(context);
    
}

export function deactivate() {

}