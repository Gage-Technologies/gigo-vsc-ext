/* eslint-disable @typescript-eslint/naming-convention */
'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import AutoGit from './vcs/auto-git';

import simpleGit, { SimpleGit } from 'simple-git';
import { format } from 'path';

let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
	let autogit = new AutoGit();
    
    let cmdversion = vscode.commands.registerCommand('autogit.version', () => {
        vscode.window.showInformationMessage('Version 1.1.4 by Eray Sönmez <dev@ray-works.de>');
    });

	let cmdinit = vscode.commands.registerCommand('autogit.init', () => {
		if(autogit.checkWorkspace() && autogit.checkGit()){
			if(!autogit.isInitialized){
				autogit.setup();
				autogit.start();
				vscode.window.showInformationMessage('Auto-Git initialized.');
			} else {
				vscode.window.showInformationMessage('Auto-Git is already initialized.');
			}
		} else {
			vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
		}
	});
    
	let cmdstart = vscode.commands.registerCommand('autogit.start', () => {
		if(autogit.checkWorkspace() && autogit.checkGit()){
            if(autogit.isInitialized){
                if(!autogit.running){
                    autogit.start();
                    vscode.window.showInformationMessage('Auto-Git started.');
                } else {       
                    vscode.window.showInformationMessage('Auto-Git is already running.');
                }
            } else {
                vscode.window.showInformationMessage('Run `Auto-Git: Init` before `Auto-Git: Start`.');
            }
		} else {
			vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
		}
	});

	let cmdstop = vscode.commands.registerCommand('autogit.stop', () => {
		if(autogit.checkWorkspace() && autogit.checkGit()){
			if(autogit.running){
				autogit.stop();
				vscode.window.showInformationMessage('Auto-Git stopped.');
			} else {
				vscode.window.showInformationMessage('Auto-Git is not running.');
			}
		} else {
			vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
		}
	});

	let cmdrestart = vscode.commands.registerCommand('autogit.restart', () => {
		if(autogit.checkWorkspace() && autogit.checkGit()){
            if(autogit.running){
                autogit.stop();
                autogit.start();
                vscode.window.showInformationMessage('Auto-Git restarted.');
            } else {
                 if(autogit.isInitialized){
                    autogit.start();
                    vscode.window.showInformationMessage('Auto-Git restarted.');
                 } else {
                     vscode.window.showInformationMessage('Run `Auto-Git: Init` before `Auto-Git: Restart`.');
                 }
            }
		} else {
			vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
		}
	});

	context.subscriptions.push(cmdinit);
	context.subscriptions.push(cmdversion);
	context.subscriptions.push(cmdstart);
	context.subscriptions.push(cmdstop);
	context.subscriptions.push(cmdrestart);

	if(autogit.isInitialized){
		var cfg = JSON.parse(fs.readFileSync(autogit.cfg, 'utf8'));
		if(cfg.runOnStart){
			autogit.start();
		}
	}

	myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
	context.subscriptions.push(myStatusBarItem);
	myStatusBarItem.show();
}

export function deactivate() {

}