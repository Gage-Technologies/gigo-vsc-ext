/* eslint-disable @typescript-eslint/naming-convention */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const auto_git_1 = require("./vcs/auto-git");
let autoGit;
function activate(context) {
    autoGit = new auto_git_1.default();
    autoGit.activate(context);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map