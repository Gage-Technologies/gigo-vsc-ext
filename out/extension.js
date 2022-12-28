'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const helloWorld_1 = require("./helloWorld");
const tutorial_1 = require("./tutorial/tutorial");
const auto_git_1 = require("./vcs/auto-git");
// import {activateTimeout} from './callback/timeout';
const webview_1 = require("./afk/webview");
const sessionUpdate_1 = require("./session/sessionUpdate");
let autoGit;
let tutorial;
function activate(context) {
    const helloCommand = vscode.commands.registerCommand("hello-world.helloWorld", () => {
        console.log("initializing hello world");
        helloWorld_1.HelloWorldPanel.render(context.extensionUri);
    });
    context.subscriptions.push(helloCommand);
    autoGit = new auto_git_1.default();
    autoGit.activate(context);
    tutorial = new tutorial_1.default(context);
    //tutorial.activate(context);
    (0, sessionUpdate_1.activateTimeout)(context);
    (0, webview_1.activateAfkWebView)(context);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map