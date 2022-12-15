'use strict';
import * as vscode from 'vscode';
import {join} from 'path';
import { Uri, Webview } from "vscode";
import { TextEncoder } from 'util';
import { vsCodeButton } from '@vscode/webview-ui-toolkit';
import { fstat } from 'fs';
import { listenerCount } from 'process';



class Tutorial implements vscode.Disposable {
    private themeConfigSection: string = 'markdown-preview-github-styles';
    private themeConfigKey: string = 'colorTheme';
    private defaultThemeConfiguration: string = 'auto';
    public tuitorialPanel!: vscode.WebviewPanel;
    public context: any;
    public toolkitUri!: vscode.Uri;
    public mainUri!: vscode.Uri;
    public baseWorkspaceUri!: vscode.Uri;

    private themeConfigValues: {[key: string]: boolean} = {
        'auto': true,
        'system': true,
        'light': true,
        'dark': true
    };
    private currentPage = 0;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        
        vscode.commands.registerCommand("controls.start", () => {
            let currentPanel = vscode.window.createWebviewPanel("controls","Page Controls",
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                }
            );
            this.tuitorialPanel = currentPanel;
            this._getCurrentPage(currentPanel.webview);
            this._setWebviewMessageListener(currentPanel.webview);
            if (!vscode.workspace.workspaceFolders) {
                vscode.window.showInformationMessage("Open a folder/workspace first");
                return;
            }
            this.baseWorkspaceUri = vscode.workspace.workspaceFolders[0].uri;
            this.baseWorkspaceUri.fsPath.replace("file://", "");
            this.render(this.tuitorialPanel, context);
            this.tuitorialPanel.onDidChangeViewState((e) => {
                this.render(e.webviewPanel, context);
            });
        });
    }

    private _getCurrentPage(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
          (message: any) => {
            const command = message.command;
            const text = message.text;
    
            switch (command) {
              case "currentPage":
                try{
                    const fs = require('fs');
                    let yamlContent = `{\"currentPageNum\": ${text}}`;
                    fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", yamlContent);
                    this.render(this.tuitorialPanel, this.context);
                }catch(err){
                    console.log(err);
                }
                
                return;
            }
          },
          undefined,
        );
    }


    public async findMDFiles(): Promise<any[]>{
        var mdArr: any[] = [];
        try{
            const fs = require('fs');
            const markdown = require('markdown-it');
            const shiki = require('shiki');
            var md: any;
            await shiki.getHighlighter({
            theme: 'github-dark'
            }).then((highlighter: { codeToHtml: (arg0: any, arg1: { lang: any; }) => any; }) => {
                const md = markdown({
                    html: true,
                    highlight: (code: any, lang: any) => {
                    return highlighter.codeToHtml(code, { lang });
                    }
                });
                let tuitotialPaths = this.baseWorkspaceUri.fsPath + "/.tutorials/";
                fs.readdir(tuitotialPaths, (err: any, files: any) => {
                    files.forEach((f: any) =>{
                        mdArr.push(md.render(fs.readFileSync(`${tuitotialPaths}${f}`, 'utf-8')));
                    });
                });
            });
            
        }catch(err){
            console.log(err);
        }
        return mdArr;
    }

    

    public async render(panel: any, context: any) {
            let mds = await this.findMDFiles();
            const fs = require('fs');
            const markdown = require('markdown-it');
            const shiki = require('shiki');
            shiki.getHighlighter({
            theme: 'github-dark'
            }).then((highlighter: { codeToHtml: (arg0: any, arg1: { lang: any; }) => any; }) => {
            const md = markdown({
                html: true,
                highlight: (code: any, lang: any) => {
                return highlighter.codeToHtml(code, { lang });
                }
            });
            var currentPgNum: any;
        

            try{
                
                if (fs.existsSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json")){
                    let obj = JSON.parse(fs.readFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", 'utf8'));
                     currentPgNum = obj.currentPageNum;
                     
                 }else{
                    
                     let yamlContent = "{\"currentPageNum\": 1}";
                     fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", yamlContent);
                     currentPgNum = 1;
                     
                 }                
            }catch(err){
                console.log(err);
                return;
            }

            const mainUri = this.getUri(panel.webview, context.extensionUri, ["src", "main.js"]);
            const toolkitUri = this.getUri(panel.webview, context.extensionUri, [
                "node_modules",
                "@vscode",
                "webview-ui-toolkit",
                "dist",
                "toolkit.js", // A toolkit.min.js file is also available
            ]);


            var previousButton = ` <vscode-button id="previousTutorial">Previous Tutorial</vscode-button>`;
            
            if (currentPgNum === 1){
                previousButton = ` <vscode-button id="previousTutorial" disabled>Previous Tutorial</vscode-button>`;
            }

            var nextButton = `<vscode-button id="nextTutorial">Next Tutorial</vscode-button>`;
            if (currentPgNum >= mds.length){
                nextButton = `<vscode-button id="nextTutorial" disabled>Next Tutorial</vscode-button>`;
            }

            let index = currentPgNum - 1;

        
    
            const out = `
                <title>Shiki</title>
                <link rel="stylesheet" href="style.css">
                <input name="currentPgNum" type="hidden" value="${currentPgNum}"></input>
                <input name="maxPageNum" type="hidden" value="${mds.length}"></input>
                
                <div id="big">
                ${mds[index]}
                </div>
                <script type="module" src="fs.js"></script>
                <script src="https://unpkg.com/shiki"></script>
                <script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/12.2.0/markdown-it.js"></script>
                <script src="index.js"></script>
                </head>
                <body>
                    ${previousButton}   
                    ${nextButton}
                   
                </body>
                <script type="module" src="${mainUri}"></script>
                <script type="module" src="${toolkitUri}"></script>
        
            `;

            panel.webview.html = out;
        });
    }
    

    private async loadHtml(webview: any, html: any) {
        webview = html;
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




    private _setWebviewMessageListener(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
          (message: any) => {
            const command = message.command;
            const text = message.text;
    
            switch (command) {
              case "hello":
                vscode.window.showInformationMessage(text);
                return;
            }
          },
          undefined,
        );
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
