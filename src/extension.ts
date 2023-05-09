
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
import { activateEditor } from './tutorial-editor/webview';
import { openStdin } from 'process';
import path = require('path');

let autoGit: AutoGit;
//let tutorial: Tutorial;



//activate function registers all listed commands and initializes some classes on startup
export function activate(context: vscode.ExtensionContext) {


    // vscode.languages.registerHoverProvider('markdown', {
    //     provideHover(document, position, token) {
    //         try{
    //             let texrEditr =  vscode.window.activeTextEditor;
    //             const decorationType = vscode.window.createTextEditorDecorationType(
    //                 {
    //                     light:
    //                     {
    //                         gutterIconPath: '/home/user/Downloads/xlf3lb2pg0x71.svg',
    //                         gutterIconSize: '85%',
    //                     },
    //                     dark:
    //                     {
    //                         gutterIconPath: '/home/user/Downloads/xlf3lb2pg0x71.svg',
    //                         gutterIconSize: '85%'
    //                     }
    //                 });
            
    //             if (texrEditr) {
    //                  texrEditr.setDecorations(decorationType, rangesO);
    //             }
    //         }catch(error){
    //             console.log(error);
    //         }
            
    //       return {
    //         contents: [`${document.lineAt(position.line).text}: ${token.onCancellationRequested}`]
    //       };
    //     }
    //   });


    let logger: Record<string, any> = {};

    console.log("before output channels")
    let errors = vscode.window.createOutputChannel("GIGO Developer Errors");
    let debug = vscode.window.createOutputChannel("GIGO Developer Debug");

    logger.error = errors;
    logger.info = debug;

    console.log("after output channels: ", logger.error)
    
    let fs = require('fs');

    var cfg = getCfg();
    if (cfg === null) {
        console.log('ERROR: CONFIGURATION FILE IS MISSING OR INCOMPLETE!');
    }

    var baseWorkspaceUri!: vscode.Uri;

    if (vscode.workspace.workspaceFolders !== undefined){
        baseWorkspaceUri = vscode.workspace.workspaceFolders[0].uri;
        baseWorkspaceUri.fsPath.replace("file://", "");
        let tourPath = path.join(baseWorkspaceUri.fsPath, ".gigo", ".tours");
        let tutorialPath = baseWorkspaceUri.fsPath + "/.gigo" + "/.tutorials";

		if (!fs.existsSync(tourPath)) {
            fs.mkdirSync(tourPath);
        }

        if (!fs.existsSync(tutorialPath)){
            fs.mkdirSync(tutorialPath);
        }
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
    activateStreakWebView(context, cfg, logger);

    logger.info.appendLine("Starting GIGO Code Teacher...");
    activateTeacherWebView(context, cfg, logger);
    
    
    console.log("calling editor activation");
    activateEditor(context);

    logger.info.appendLine("GIGO Extension Setup...");
    
}

export function getCfg(){

    

    var cfg: any;
    try{
        const homedir = require('os').homedir();
        const fs = require('fs');
        const path = require('node:path');
  
        let cfgPath = path.join(homedir, '.gigo/ws-config.json')
        let cfgFile = fs.readFileSync(cfgPath, 'utf-8');
        cfg = JSON.parse(cfgFile);
        console.log(cfg);
    }catch(e){
        console.log(e);
        return;
    }

    return cfg;
}

export function deactivate() {

}