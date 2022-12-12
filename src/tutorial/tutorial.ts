'use strict';
import * as vscode from 'vscode';
import {join} from 'path';
import { Uri, Webview } from "vscode";
import { TextEncoder } from 'util';



class Tutorial implements vscode.Disposable {
    private themeConfigSection: string = 'markdown-preview-github-styles';
    private themeConfigKey: string = 'colorTheme';
    private defaultThemeConfiguration: string = 'auto';
    public tuitorialPanel!: vscode.WebviewPanel;
    public context: any;
    public toolkitUri!: vscode.Uri;
    public mainUri!: vscode.Uri;

    private themeConfigValues: {[key: string]: boolean} = {
        'auto': true,
        'system': true,
        'light': true,
        'dark': true
    };
    private currentPage = 0;

    constructor(context: any) {
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
            this.mainUri = mainUri;
            const toolkitUri = this.getUri(currentPanel.webview, context.extensionUri, [
                "node_modules",
                "@vscode",
                "webview-ui-toolkit",
                "dist",
                "toolkit.js", // A toolkit.min.js file is also available
              ]);
              this.toolkitUri = toolkitUri;

            let html = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/tuitorial-1.md", 'utf-8'));
            let html2 = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/tuitorial-2.md", 'utf-8'));

            console.log(html2);

            var currentPgNum: any;

            try{
                if (fs.existsSync("/home/user/Development/Fun/hopeThisWorks/config.json")){
                    let obj = JSON.parse(fs.readFileSync('/home/user/Development/Fun/hopeThisWorks/config.json', 'utf8'));
                     currentPgNum = obj.currentPageNum;
                     
                 }else{
                     let yamlContent = "{\"currentPageNum\": 1}";
                     fs.writeFileSync("/home/user/Development/Fun/hopeThisWorks/config.json", yamlContent);
                     currentPgNum = 1;
                 }
     
                console.log(currentPgNum);
                 if (currentPgNum > 1){
                     html = html2;
                 }
            }catch(err){
                console.log(err);
            }

          
            
            //window.showTextDocument(fileUri, { preview: false });

            
    
            const out = `
                <title>Shiki</title>
                <link rel="stylesheet" href="style.css">
                <div id="big">
                ${html}
                </div>
                <script id="test" type="module">${html2}</script>
                <script type="module" src="${mainUri}"></script>
                <script type="module" src="${toolkitUri}"></script>
                <script type="module" src="fs.js"></script>
                <script src="https://unpkg.com/shiki"></script>
                <script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/12.2.0/markdown-it.js"></script>
                <script src="index.js"></script>
                </head>
                <body>
                    <vscode-button id="nextTuitorial">Next Tuitorial</vscode-button>
                </body>
            
            `;

        
        
            this.tuitorialPanel.webview.html = out;
            
            
            

            // vscode.window.activeTextEditor?.hide;
            // vscode.commands.executeCommand("workbench.action.closeActiveEditor");

            console.log(mainUri);

            console.log('done');
            
            this.tuitorialPanel.onDidChangeViewState((e) => {
                this.reRender(e.webviewPanel, context);
            });
          
            });
            
        });

        
        
        
    }

    private _getCurrentPage(webview: vscode.Webview) {
        webview.onDidReceiveMessage(
          (message: any) => {
            const command = message.command;
            const text = message.text;
    
            switch (command) {
              case "currenPage":
                try{
                    const fs = require('fs');
                    let yamlContent = `{\"currentPageNum\": ${text}}`;
                    fs.writeFileSync("/home/user/Development/Fun/hopeThisWorks/config.json", yamlContent);
                }catch(err){
                    console.log(err);
                }
                
                return;
            }
          },
          undefined,
        );
    }


    

    public reRender(panel: any, context: any) {
            console.log("re render")
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

            let html = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/tuitorial-1.md", 'utf-8'));
            let html2 = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/tuitorial-2.md", 'utf-8'));

            console.log(html2);

            var currentPgNum: any;

            try{
                if (fs.existsSync("/home/user/Development/Fun/hopeThisWorks/config.json")){
                    let obj = JSON.parse(fs.readFileSync('/home/user/Development/Fun/hopeThisWorks/config.json', 'utf8'));
                     currentPgNum = obj.currentPageNum;
                     
                 }else{
                     let yamlContent = "{\"currentPageNum\": 1}";
                     fs.writeFileSync("/home/user/Development/Fun/hopeThisWorks/config.json", yamlContent);
                     currentPgNum = 1;
                 }
     
                console.log(currentPgNum);
                 if (currentPgNum > 1){
                     html = html2;
                 }
            }catch(err){
                console.log(err);
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

            console.log("before render out");
            console.log(this.mainUri);
    
            const out = `
                <title>Shiki</title>
                <link rel="stylesheet" href="style.css">
                <div id="big">
                ${html}
                </div>
                <script id="test" type="module">${html2}</script>
                <script type="module" src="${mainUri}"></script>
                <script type="module" src="${toolkitUri}"></script>
                <script type="module" src="fs.js"></script>
                <script src="https://unpkg.com/shiki"></script>
                <script type="module" src="https://cdnjs.cloudflare.com/ajax/libs/markdown-it/12.2.0/markdown-it.js"></script>
                <script src="index.js"></script>
                </head>
                <body>
                    <vscode-button id="nextTuitorial">Next Tuitorial</vscode-button>
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

                console.log(mainUri);

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
