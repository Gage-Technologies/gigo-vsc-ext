
'use strict';
import * as vscode from 'vscode';
import { HelloWorldPanel } from './helloWorld';
import Tutorial from './tutorial/tutorial';
import AutoGit from './vcs/auto-git';
// import {activateTimeout} from './callback/timeout';
import { activateAfkWebView } from './afk/webview';
import { activateTimeout } from './session/sessionUpdate';

let autoGit: AutoGit;
let tutorial: Tutorial;

export function activate(context: vscode.ExtensionContext) {

    
    const helloCommand = vscode.commands.registerCommand("hello-world.helloWorld", () => {
        console.log("initializing hello world");
        HelloWorldPanel.render(context.extensionUri);
    });
    
    context.subscriptions.push(helloCommand);

    autoGit = new AutoGit();
    autoGit.activate(context);

    tutorial = new Tutorial(context);
    //tutorial.activate(context);
    activateTimeout(context);

    
    activateAfkWebView(context);
    
}

export function deactivate() {

}