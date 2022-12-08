'use strict';
import * as vscode from 'vscode';
import {join} from 'path';
import { Uri, Webview } from "vscode";

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
    private currentPage = 0;

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

    private getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
        return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
      }

    public activate(context: vscode.ExtensionContext): object {

        // console.log(this.getColorTheme());
        
        context.subscriptions.push(
            vscode.commands.registerCommand("controls.start", () => {
                let currentPanel = vscode.window.createWebviewPanel("controls","Page Controls",
                    vscode.ViewColumn.Active,
                    {
                        enableScripts: true,
                    }
                );

                const fs = require('fs');
                const markdown = require('markdown-it');
                const shiki = require('shiki');
                //const t = shiki.loadTheme(join(process.cwd(), 'vscode.theme-kimbie-dark'));

                shiki.getHighlighter({
                theme: 'github-dark'
                }).then((highlighter: { codeToHtml: (arg0: any, arg1: { lang: any; }) => any; }) => {
                const md = markdown({
                    html: true,
                    highlight: (code: any, lang: any) => {
                    return highlighter.codeToHtml(code, { lang });
                    }
                });

                const mainUri = this.getUri(currentPanel.webview, context.extensionUri, ["src", "main.js"]);
                const toolkitUri = this.getUri(currentPanel.webview, context.extensionUri, [
                    "node_modules",
                    "@vscode",
                    "webview-ui-toolkit",
                    "dist",
                    "toolkit.js", // A toolkit.min.js file is also available
                  ]);

                const html = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/tutitorial-1.md", 'utf-8'));
        
                const out = `
                    <title>Shiki</title>
                    <link rel="stylesheet" href="style.css">
                    ${html}
                    <script type="module" src="${mainUri}"></script>
                    <script type="module" src="${toolkitUri}"></script>
                    <script src="index.js"></script>
                    </head>
                    <body>
                        <vscode-button id="nextTuitorial">Next Tuitorial</vscode-button>
                    </body>
                
                `;
                currentPanel.webview.html = out;

                console.log('done');
                });

                

                // var hljs = require('highlight.js'); // https://highlightjs.org/

                // // Actual default values
                // var md = require('markdown-it')({
                //     html:         false,        // Enable HTML tags in source
                //     xhtmlOut:     false,        // Use '/' to close single tags (<br />).
                //                                 // This is only for full CommonMark compatibility.
                //     breaks:       true,        // Convert '\n' in paragraphs into <br>
                //     langPrefix:   'language-',  // CSS language prefix for fenced blocks. Can be
                //                                 // useful for external highlighters.
                //     linkify:      true,        // Autoconvert URL-like text to links

                //     // Enable some language-neutral replacement + quotes beautification
                //     // For the full list of replacements, see https://github.com/markdown-it/markdown-it/blob/master/lib/rules_core/replacements.js
                //     typographer:  true,

                //     // Double + single quotes replacement pairs, when typographer enabled,
                //     // and smartquotes on. Could be either a String or an Array.
                //     //
                //     // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
                //     // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
                //     quotes: '“”‘’',
                //     highlight: function (str: any, lang: any) {
                //         console.log("checking lang: ", lang);
                //         if (lang && hljs.getLanguage(lang)) {
                //             console.log("language is valid: ", str);
                //             try {
                //                 return hljs.highlight(str, { language: lang }).value;
                //             } catch (err) {
                //                 console.log("failed to highlight syntax: ", err);
                //             }
                //         }

                //         return '';
                //     }
                // });

                // // md.use(this.plugin)

                // // var MarkDownIt = require('markdown-it'),
                // //     md = new MarkDownIt();
                
                // // const render = md.render.renderer;

                // const mdr = vscode.Uri.file("/home/user/Development/Fun/hopeThisWorks/README.md");

               
                // vscode.workspace.openTextDocument(mdr).then((document) =>{
                //     let text = document.getText();

                //     console.log("rendered:\n",  md.render(text));
                    
                //     currentPanel.webview.html = `
                //     <!DOCTYPE html>
                //     <html lang="en">
                //     <head>
                //         <meta charset="UTF-8">
                //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
                //         <title>GIGO Tutorial</title>
                //     </head>
                //     <body>
                //     ${md.render(text)}
                //     </body>
                //     </html>
                //     `;
                // });
                
                
            
                // currentPanel.webview.postMessage("yo was good chief");
                // vscode.commands.executeCommand('markdown.showPreview');
                
            
            }),
           
            vscode.workspace.onDidChangeConfiguration(e  => {
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
