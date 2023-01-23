
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


    let logger: Record<string, any> = {};

    console.log("before output channels")
    let errors = vscode.window.createOutputChannel("GIGO Developer Errors");
    let debug = vscode.window.createOutputChannel("GIGO Developer Debug");

    logger.error = errors;
    logger.info = debug;

    console.log("after output channels: ", logger.error)
    

    var cfg = getCfg();
    if (cfg === null) {
        console.log('ERROR: CONFIGURATION FILE IS MISSING OR INCOMPLETE!');
    }



    logger.info.appendLine("Starting GIGO Autogit...");
    //registser autoGit command using its local activation function
    autoGit = new AutoGit(cfg.workspace_settings.auto_git, logger);
    autoGit.activate(context);

    console.log("after auto git");

    //start tutorial using its local activation function
    // tutorial = new Tutorial(context);
    logger.info.appendLine("Starting GIGO Session...");
    activateTimeout(context, cfg, logger);

    console.log("calling afk activation");

    logger.info.appendLine("Starting GIGO AFK Page...");
    //start afk using its local activation function
    activateAfkWebView(context, cfg, logger);

    logger.info.appendLine("Starting GIGO Tutorial...");
    activateTutorialWebView(context, logger);

    logger.info.appendLine("Starting GIGO Streak...");
    activateStreakWebView(context, logger);

    logger.info.appendLine("Starting GIGO Code Teacher...");
    activateTeacherWebView(context, logger);
    
    logger.info.appendLine("GIGO Extension Setup...");
    
}

export function getCfg(){

    var cfg: any;
    try{
        const fs = require('fs');
        let cfgFile = fs.readFileSync(`/home/gigo/.gigo/ws-config.json`, 'utf-8');
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