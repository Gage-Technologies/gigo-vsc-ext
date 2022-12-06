'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Tutorial {
    constructor() {
        this.themeConfigSection = 'markdown-preview-github-styles';
        this.themeConfigKey = 'colorTheme';
        this.defaultThemeConfiguration = 'auto';
        this.themeConfigValues = {
            'auto': true,
            'system': true,
            'light': true,
            'dark': true
        };
    }
    dispose() {
    }
    getColorTheme() {
        const settings = vscode.workspace.getConfiguration(this.themeConfigSection, null);
        return this.validThemeConfigurationValue(settings.get(this.themeConfigKey, this.defaultThemeConfiguration));
    }
    validThemeConfigurationValue(theme) {
        return !this.themeConfigValues[theme]
            ? this.defaultThemeConfiguration
            : theme;
    }
    activate(context) {
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(this.themeConfigSection)) {
                vscode.commands.executeCommand('markdown.preview.refresh');
            }
        }));
        let plugin = this.plugin;
        return {
            extendMarkdownIt(md) {
                return md.use(plugin);
            }
        };
    }
    plugin(md) {
        const render = md.renderer.render;
        md.renderer.render = function () {
            return `<div class="github-markdown-body github-markdown-${this.getColorTheme()}">
                <div class="github-markdown-content">${render.apply(md.renderer, arguments)}</div>
            </div>`;
        };
        return md;
    }
}
exports.default = Tutorial;
//# sourceMappingURL=tutorial.js.map