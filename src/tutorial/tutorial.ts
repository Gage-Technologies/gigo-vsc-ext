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

            //console.log(mainUri);

            console.log('done');
            
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
                    console.log(`currentPageNum: ${text}`)
                    const fs = require('fs');
                    let yamlContent = `{\"currentPageNum\": ${text}}`;
                    fs.writeFileSync("/home/user/Development/Fun/hopeThisWorks/config.json", yamlContent);
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
            //const t = shiki.loadTheme(join(process.cwd(), 'vscode.theme-kimbie-dark'));
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
                let tuitotialPaths = this.baseWorkspaceUri.fsPath + "/.tuitorials/";
                console.log()
                fs.readdir(tuitotialPaths, (err: any, files: any) => {
                    //console.log(`error: ${err}`);
                    files.forEach((f: any) =>{
                        //console.log(`file: ${f}`);
                        mdArr.push(md.render(fs.readFileSync(`${tuitotialPaths}${f}`, 'utf-8')));
                        console.log(`here: ${mdArr.length}`)
                        // console.log(md.render(fs.readFileSync(`${tuitotialPaths}${f}`, 'utf-8')))
                    });
                });
                console.log("internal length: ", mdArr.length)
                //return mdArr;
            });
            
        }catch(err){
            console.log(err);
        }
        console.log("md length: ", mdArr.length)
        return mdArr;
    }

    

    public async render(panel: any, context: any) {
            //console.log(panel.workspace)
            console.log("before find")
            let mds = await this.findMDFiles();
            //this.findMDFiles(context);
            console.log("re render");
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

            let html = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/.tuitorials/tuitorial-1.md", 'utf-8'));
            let html2 = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/.tuitorials/tuitorial-2.md", 'utf-8'));

            //console.log(html2);

            var currentPgNum: any;
            var htmlList: string = "";
        

            try{
                
                if (fs.existsSync("/home/user/Development/Fun/hopeThisWorks/config.json")){
                    let obj = JSON.parse(fs.readFileSync('/home/user/Development/Fun/hopeThisWorks/config.json', 'utf8'));
                     currentPgNum = obj.currentPageNum;
                     console.log(`current#1: ${currentPgNum}`);
                     
                 }else{
                     let yamlContent = "{\"currentPageNum\": 1}";
                     fs.writeFileSync("/home/user/Development/Fun/hopeThisWorks/config.json", yamlContent);
                     currentPgNum = 1;
                     console.log(`current#2: ${currentPgNum}`);
                 }
                 console.log(`current#3: ${currentPgNum}`);
                 //let sortedmds = mds.sort();
                 console.log(`mds: ${mds}`)
                
                 let i = 1;
                 for (var mdrs in mds){
                   
                    htmlList +=  `<script id="t-${mdrs}" type="module">${mds[mdrs]}</script>`;
                    i += 1;
                 }
                 console.log("#############################################################################################################################################")
                 console.log(htmlList)
                 console.log("#############################################################################################################################################")
                
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

          
            
            //window.showTextDocument(fileUri, { preview: false });

            var previousButton = ` <vscode-button id="previousTuitorial">Previous Tuitorial</vscode-button>`;
            if (currentPgNum === 1){
                previousButton = "";
            }

            var nextButton = `<vscode-button id="nextTuitorial">Next Tuitorial</vscode-button>`;
            if (currentPgNum >= mds.length){
                nextButton = "";
            }
         
    
            const out = `
                <title>Shiki</title>
                <link rel="stylesheet" href="style.css">
                <script id="currentPgNum" type="module" src="${currentPgNum}"></script>
                <script id="maxPageNum" type="module" src="${mds.length + 1}"></script>
                <div id="big">
                ${mds[currentPgNum - 1]}
                </div>
                ${htmlList}
                <script type="module" src="${mainUri}"></script>
                <script type="module" src="${toolkitUri}"></script>
                <script type="module" src="fs.js"></script>
                <script src="https://unpkg.com/shiki"></script>
                <script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/12.2.0/markdown-it.js"></script>
                <script src="index.js"></script>
                </head>
                <body>
                    ${previousButton}   
                    ${nextButton}
                   
                </body>
            
            `;
           
            panel.webview.html = out;
        });
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

                this._setWebviewMessageListener(currentPanel.webview);

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

                const html = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/tuitorial-1.md", 'utf-8'));
        
                const out = `
                    <title>Shiki</title>
                    <link rel="stylesheet" href="style.css">
                    ${html}
                    <script type="module" src="${mainUri}"></script>
                    <script type="module" src="${toolkitUri}"></script>
                    </head>
                    <body>
                        <vscode-button id="nextTuitorial">Next Tuitorial</vscode-button>
                    </body>
                
                `;
                currentPanel.webview.html = out;

              

                console.log('done');
                });

                

               
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
