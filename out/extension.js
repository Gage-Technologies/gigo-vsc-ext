'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const tutorial_1 = require("./tutorial/tutorial");
const auto_git_1 = require("./vcs/auto-git");
// import {activateTimeout} from './callback/timeout';
const webview_1 = require("./afk/webview");
const sessionUpdate_1 = require("./session/sessionUpdate");
let autoGit;
let tutorial;
//activate function registers all listed commands and initializes some classes on startup
function activate(context) {
    //registser autoGit command using its local activation function
    autoGit = new auto_git_1.default();
    autoGit.activate(context);
    //start tutorial using its local activation function
    tutorial = new tutorial_1.default(context);
    (0, sessionUpdate_1.activateTimeout)(context);
    //start afk using its local activation function
    (0, webview_1.activateAfkWebView)(context);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map