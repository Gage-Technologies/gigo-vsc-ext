'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
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
    //registser autoGit command using its local activation function
    autoGit = new auto_git_1.default();
    autoGit.activate(context);
    //start tutorial using its local activation function
    // tutorial = new Tutorial(context);
    (0, sessionUpdate_1.activateTimeout)(context);
    console.log("calling afk activation");
    //start afk using its local activation function
    (0, webview_1.activateAfkWebView)(context);
    (0, webview_2.activateTutorialWebView)(context);
    (0, webview_3.activateStreakWebView)(context);
    (0, webview_4.activateTeacherWebView)(context);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map