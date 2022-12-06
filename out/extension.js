'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const tutorial_1 = require("./tutorial/tutorial");
const auto_git_1 = require("./vcs/auto-git");
let autoGit;
let tutorial;
function activate(context) {
    autoGit = new auto_git_1.default();
    autoGit.activate(context);
    tutorial = new tutorial_1.default();
    return tutorial.activate(context);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map