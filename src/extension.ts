
'use strict';
import * as vscode from 'vscode';
import Tutorial from './tutorial/tutorial';
import AutoGit from './vcs/auto-git';

let autoGit: AutoGit;
let tutorial: Tutorial;

export function activate(context: vscode.ExtensionContext) {
    autoGit = new AutoGit();
    autoGit.activate(context);

    tutorial = new Tutorial();
    return tutorial.activate(context);
}

export function deactivate() {

}