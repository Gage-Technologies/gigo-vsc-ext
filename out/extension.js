'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.getCfg = exports.activate = void 0;
const vscode = require("vscode");
//import Tutorial from './tutorial/tutorial';
const auto_git_1 = require("./vcs/auto-git");
// import {activateTimeout} from './callback/timeout';
const webview_1 = require("./afk/webview");
const sessionUpdate_1 = require("./session/sessionUpdate");
const webview_2 = require("./tutorial/webview");
const webview_3 = require("./streak/webview");
const webview_4 = require("./teacher/webview");
let autoGit;
//let tutorial: Tutorial;
//activate function registers all listed commands and initializes some classes on startup
function activate(context) {
    let logger = {};
    console.log("before output channels");
    let errors = vscode.window.createOutputChannel("GIGO Developer Errors");
    let debug = vscode.window.createOutputChannel("GIGO Developer Debug");
    logger.error = errors;
    logger.info = debug;
    console.log("after output channels: ", logger.error);
    var cfg = getCfg();
    if (cfg === null) {
        console.log('ERROR: CONFIGURATION FILE IS MISSING OR INCOMPLETE!');
    }
    logger.info.appendLine("Starting GIGO Autogit...");
    //registser autoGit command using its local activation function
    autoGit = new auto_git_1.default(cfg.workspace_settings.auto_git, logger);
    autoGit.activate(context);
    console.log("after auto git");
    //start tutorial using its local activation function
    // tutorial = new Tutorial(context);
    logger.info.appendLine("Starting GIGO Session...");
    (0, sessionUpdate_1.activateTimeout)(context, cfg, logger);
    console.log("calling afk activation");
    logger.info.appendLine("Starting GIGO AFK Page...");
    //start afk using its local activation function
    (0, webview_1.activateAfkWebView)(context, cfg, logger);
    logger.info.appendLine("Starting GIGO Tutorial...");
    (0, webview_2.activateTutorialWebView)(context, logger);
    logger.info.appendLine("Starting GIGO Streak...");
    (0, webview_3.activateStreakWebView)(context, logger);
    logger.info.appendLine("Starting GIGO Code Teacher...");
    (0, webview_4.activateTeacherWebView)(context, logger);
    logger.info.appendLine("GIGO Extension Setup...");
}
exports.activate = activate;
function getCfg() {
    var cfg;
    try {
        const homedir = require('os').homedir();
        const fs = require('fs');
        const path = require('node:path');
        let cfgPath = path.join(homedir, '.gigo/ws-config.json');
        let cfgFile = fs.readFileSync(cfgPath, 'utf-8');
        cfg = JSON.parse(cfgFile);
        console.log(cfg);
    }
    catch (e) {
        console.log(e);
        return;
    }
    return cfg;
}
exports.getCfg = getCfg;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map