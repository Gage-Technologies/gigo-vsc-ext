'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.getCfg = exports.activate = void 0;
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
    var cfg = getCfg();
    if (cfg === null) {
        console.log('ERROR: CONFIGURATION FILE IS MISSING OR INCOMPLETE!');
    }
    //registser autoGit command using its local activation function
    autoGit = new auto_git_1.default(cfg.workspace_settings.auto_git);
    autoGit.activate(context);
    //start tutorial using its local activation function
    // tutorial = new Tutorial(context);
    (0, sessionUpdate_1.activateTimeout)(context);
    console.log("calling afk activation");
    //start afk using its local activation function
    (0, webview_1.activateAfkWebView)(context, cfg);
    (0, webview_2.activateTutorialWebView)(context);
    (0, webview_3.activateStreakWebView)(context);
    (0, webview_4.activateTeacherWebView)(context);
}
exports.activate = activate;
function getCfg() {
    var cfg;
    try {
        const fs = require('fs');
        let cfgFile = fs.readFileSync(`/home/user/.gigo/ws-config.json`, 'utf-8');
        cfg = JSON.parse(cfgFile);
        console.log(`config: ${cfg.workspace_settings.runOnStart}`);
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