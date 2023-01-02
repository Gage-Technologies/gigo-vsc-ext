'use strict';
import * as vscode from 'vscode';
import { Uri, Webview } from "vscode";


//Tutotial class contorls all pre-defined README.md
//READMEs will automatically render with markdown syntax highlighting
class Tutorial implements vscode.Disposable {
    //defining local variables
    private themeConfigSection: string = 'markdown-preview-github-styles';
    private themeConfigKey: string = 'colorTheme';
    private defaultThemeConfiguration: string = 'auto';
    public tuitorialPanel!: vscode.WebviewPanel;
    public context: any;
    public toolkitUri!: vscode.Uri;
    public mainUri!: vscode.Uri;
    public baseWorkspaceUri!: vscode.Uri;

    //defining base color pallettes
    private themeConfigValues: {[key: string]: boolean} = {
        'auto': true,
        'system': true,
        'light': true,
        'dark': true
    };
    private currentPage = 0;

    //constructor acts as activate function in lieu of main function
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        
        //register tuitorial start commad for user to start at desired time
        vscode.commands.registerCommand("tutorial.start", () => {
            //create a new webview panel to hold content of first README
            let currentPanel = vscode.window.createWebviewPanel("tutorial","GIGO Tutorial",
                //render webview in active view column to the right of editor
                vscode.ViewColumn.Active,
                {
                    enableScripts: true,
                }
            );
            this.tuitorialPanel = currentPanel;
            
            //determine first README to start on
            this._getCurrentPage(currentPanel.webview);

            //start message listener for pop-ups ands debug messages to be displayed in editor
            this._setWebviewMessageListener(currentPanel.webview);

            //ensure that user has opened a project before continuing
            if (!vscode.workspace.workspaceFolders) {
                vscode.window.showInformationMessage("Open a folder/workspace first");
                return;
            }

            //set base path of workspace for future file handling 
            this.baseWorkspaceUri = vscode.workspace.workspaceFolders[0].uri;
            this.baseWorkspaceUri.fsPath.replace("file://", "");
            //call render for first page
            this.render(this.tuitorialPanel, context);
            //rerender whenever page changes
            this.tuitorialPanel.onDidChangeViewState((e) => {
                this.render(e.webviewPanel, context);
            });
        });
    }

    //_getCurrentPage retrieves the number of the current page from the configfile
    private _getCurrentPage(webview: vscode.Webview) {
        //get message from message hander of current page number
        webview.onDidReceiveMessage(
          (message: any) => {
            const command = message.command;
            const text = message.text;
    
            //verify command received is currentPage and write to config file
            switch (command) {
              case "currentPage":
                try{
                    const fs = require('fs');
                    //create json formatted string
                    let yamlContent = `{\"currentPageNum\": ${text}}`;
                    //write json formatted string to config file
                    fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", yamlContent);
                    //render page with current page number as main page
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

    //findMDFiles finds all markdown files in the workspace folder
    public async findMDFiles(): Promise<any[]>{
        var mdArr: any[] = [];
        try{
            const fs = require('fs');
            const markdown = require('markdown-it');
            const shiki = require('shiki');
            var md: any;

            //use shikit to render markdown syntax and get all markdown files
            await shiki.getHighlighter({
            theme: 'github-dark'
            }).then((highlighter: { codeToHtml: (arg0: any, arg1: { lang: any; }) => any; }) => {
                //render markdown with shiki highlighter
                const md = markdown({
                    html: true,
                    highlight: (code: any, lang: any) => {
                    return highlighter.codeToHtml(code, { lang });
                    }
                });
                //get path to tutorial
                let tuitotialPaths = this.baseWorkspaceUri.fsPath + "/.tutorials/";
                //get all README files from file path and push to markdown array
                fs.readdir(tuitotialPaths, (err: any, files: any) => {
                    files.forEach((f: any) =>{
                        mdArr.push(md.render(fs.readFileSync(`${tuitotialPaths}${f}`, 'utf-8')));
                    });
                });
            });
            
        }catch(err){
            console.log(err);
        }
        //return markdown array
        return mdArr;
    }

    

    //render function dislpays markdown files and page controls in HTML
    public async render(panel: any, context: any) {
            //get markdown files
            let mds = await this.findMDFiles();

            //init packages
            const fs = require('fs');
            const markdown = require('markdown-it');
            const shiki = require('shiki');

            //get shiki highlighter
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
        
            //check if tutorial config exists and get current page number
            try{
                //if tutorial config exists get current page number from it
                if (fs.existsSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json")){
                    let obj = JSON.parse(fs.readFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", 'utf8'));
                     currentPgNum = obj.currentPageNum;
                     
                 }else{
                    //if tutorial config does not exist create it and set current page number to 1
                     let yamlContent = "{\"currentPageNum\": 1}";
                     fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.tutorial_config.json", yamlContent);
                     currentPgNum = 1;
                     
                 }                
            }catch(err){
                console.log(err);
                return;
            }

            //get uri of main.js and toolkit uri
            const mainUri = this.getUri(panel.webview, context.extensionUri, ["src", "main.js"]);
            const toolkitUri = this.getUri(panel.webview, context.extensionUri, [
                "node_modules",
                "@vscode",
                "webview-ui-toolkit",
                "dist",
                "toolkit.js", // A toolkit.min.js file is also available
            ]);


            //html of previous button
            var previousButton = ` <vscode-button id="previousTutorial">Previous Tutorial</vscode-button>`;
            
            //if current page number is 1 disable previoous button
            if (currentPgNum === 1){
                previousButton = ` <vscode-button id="previousTutorial" disabled>Previous Tutorial</vscode-button>`;
            }

            //html of next button
            var nextButton = `<vscode-button id="nextTutorial">Next Tutorial</vscode-button>`;

            //if current page number is last page disable next button
            if (currentPgNum >= mds.length){
                nextButton = `<vscode-button id="nextTutorial" disabled>Next Tutorial</vscode-button>`;
            }

            //set current index to bed 1 less than current page
            let index = currentPgNum - 1;

        
            //render html
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
            
            //set page html to render html
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
    

    //check if config value is valid
    private validThemeConfigurationValue(theme: string): string {
        return !this.themeConfigValues[theme]
            ? this.defaultThemeConfiguration
            : theme;
    }

    //get uri of specified file
    private getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
        return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
      }




    //_setWebviewMessageListener callback function for pop-up and debug messages in editor
    private _setWebviewMessageListener(webview: vscode.Webview) {
        //when message is received check if command is hello
        webview.onDidReceiveMessage(
          (message: any) => {
            const command = message.command;
            const text = message.text;
    
            //display message as pop-up if command is hello
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
