
'use strict';
import * as vscode from 'vscode';
import { HelloWorldPanel } from './helloWorld';
//import Tutorial from './tutorial/tutorial';
import AutoGit from './vcs/auto-git';
// import {activateTimeout} from './callback/timeout';
import { activateAfkWebView } from './afk/webview';
import { activateTimeout } from './session/sessionUpdate';
import { activateTutorialWebView } from './tutorial/webview';
import {activateStreakWebView} from './streak/webview';
import { activateTeacherWebView } from './teacher/webview';

let autoGit: AutoGit;
//let tutorial: Tutorial;

//activate function registers all listed commands and initializes some classes on startup
export function activate(context: vscode.ExtensionContext) {

    
    

    var cfg = getCfg();
    if (cfg === null) {
        console.log('ERROR: CONFIGURATION FILE IS MISSING OR INCOMPLETE!');
    }

    //registser autoGit command using its local activation function
    autoGit = new AutoGit(cfg.workspace_settings.auto_git);
    autoGit.activate(context);

    //start tutorial using its local activation function
    // tutorial = new Tutorial(context);
    activateTimeout(context, cfg);

    console.log("calling afk activation");
    //start afk using its local activation function
    activateAfkWebView(context, cfg);

    activateTutorialWebView(context);

    activateStreakWebView(context);

    activateTeacherWebView(context);
    
    
}

export function getCfg(){
    var cfg: any;
    try{
        const fs = require('fs');
        let cfgFile = fs.readFileSync(`/home/user/.gigo/ws-config.json`, 'utf-8');
        cfg = JSON.parse(cfgFile);
        console.log(`config: ${cfg.workspace_settings.runOnStart}`);
    }catch(e){
        console.log(e);
        return;
    }

    return cfg;
}

export function deactivate() {

}