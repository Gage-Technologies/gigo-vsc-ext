'use strict';
import * as vscode from 'vscode';

class Tutorial implements vscode.Disposable {
    private themeConfigSection: string = 'markdown-preview-github-styles';
    private themeConfigKey: string = 'colorTheme';
    private defaultThemeConfiguration: string = 'auto';
    private themeConfigValues: {[key: string]: boolean} = {
        'auto': true,
        'system': true,
        'light': true,
        'dark': true
    };

    constructor() {
    }

    dispose(): void {
    }
    
    private getColorTheme() {
        const settings = vscode.workspace.getConfiguration(this.themeConfigSection, null);
        return this.validThemeConfigurationValue(settings.get(this.themeConfigKey, this.defaultThemeConfiguration));
    }
    
    private validThemeConfigurationValue(theme: string): string {
        return !this.themeConfigValues[theme]
            ? this.defaultThemeConfiguration
            : theme;
    }

    public activate(context: vscode.ExtensionContext): object {
        context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e  => {
            if (e.affectsConfiguration(this.themeConfigSection)) {
                vscode.commands.executeCommand('markdown.preview.refresh');
            }
        }));

        let plugin = this.plugin;
    
        return {
            extendMarkdownIt(md: any) {
                return md.use(plugin);
            }
        };
    }


    private plugin(md: any) {
        const render = md.renderer.render;
        md.renderer.render = function() {
            return `<div class="github-markdown-body github-markdown-${this.getColorTheme()}">
                <div class="github-markdown-content">${render.apply(md.renderer, arguments)}</div>
            </div>`;
        };
        return md;
    }
}

export default Tutorial;
