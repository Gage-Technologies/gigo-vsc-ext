/* eslint-disable @typescript-eslint/naming-convention */
'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import AutoGit from './vcs/auto-git';

import simpleGit, { SimpleGit } from 'simple-git';
import { format } from 'path';

let autoGit: AutoGit;

export function activate(context: vscode.ExtensionContext) {
    autoGit = new AutoGit();
    autoGit.activate(context);
}

export function deactivate() {

}