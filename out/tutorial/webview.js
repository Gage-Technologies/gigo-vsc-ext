"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateTutorialWebView = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
//activateAfkWebview is called upon extension start and registers necessary commands for afk functionality
async function activateTutorialWebView(context) {
    //register afk provider by calling class constructor
    const provider = new TutorialWebViewprovider(context.extensionUri);
    if (provider.codeTour) {
        provider.codeTour.activate();
    }
    //push and regsitser necessary commands
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(TutorialWebViewprovider.viewType, provider));
}
exports.activateTutorialWebView = activateTutorialWebView;
//afk webview provider has basic functions for handling afk system
class TutorialWebViewprovider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
        //defining local variables
        this.themeConfigSection = 'markdown-preview-github-styles';
        this.themeConfigKey = 'colorTheme';
        this.defaultThemeConfiguration = 'auto';
        this.isTutorialActive = true;
        this.minPages = 1;
        this.maxPages = 8;
        this.numOfTutorials = 0;
        this.pageButtonsHTML = "";
        this.tourSteps = [];
        this.codeTour = vscode.extensions.getExtension("vsls-contrib.codetour");
        //defining base color pallettes
        this.themeConfigValues = {
            'auto': true,
            'system': true,
            'light': true,
            'dark': true
        };
        this.currentPage = 0;
        // load configuration value for afk from
        let gigoConfig = vscode.workspace.getConfiguration("gigo");
        this.isTutorialActive = gigoConfig.get("gigo.tutorial.on");
    }
    //_getCurrentPage retrieves the number of the current page from the configfile
    _getCurrentPage(webview) {
        //get message from message hander of current page number
        webview.onDidReceiveMessage(async (message) => {
            const command = message.command;
            const text = message.text;
            //verify command received is currentPage and write to config file
            switch (command) {
                case "currentPage":
                    try {
                        const fs = require('fs');
                        //create json formatted string
                        let yamlContent = `{\"currentPageNum\": ${text}}`;
                        //write json formatted string to config file
                        fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.gigo/tutorial/.tutorial_config.json", yamlContent);
                        //render page with current page number as main page
                        if (this._view) {
                            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
                            await this._getHtmlForWebview(this._view.webview, "");
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
                case "nextGroup":
                    try {
                        if (this._view) {
                            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
                            await this._getHtmlForWebview(this._view.webview, "next");
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
                case "lastGroup":
                    try {
                        if (this._view) {
                            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
                            await this._getHtmlForWebview(this._view.webview, "last");
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
                case "startCodeTour":
                    try {
                        if (this.codeTour) {
                            const codeTourApi = this.codeTour.exports;
                            let uri = vscode.Uri.file(`${this.baseWorkspaceUri.fsPath}/.tours/tutorial-${message.text}.tour`);
                            codeTourApi.startTourByUri(uri);
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
                case "startCodeTourStep":
                    try {
                        const step = message.step;
                        if (this.codeTour) {
                            const codeTourApi = this.codeTour.exports;
                            let uri = vscode.Uri.file(`${this.baseWorkspaceUri.fsPath}/.tours/tutorial-${message.text}.tour`);
                            try {
                                await codeTourApi.endCurrentTour();
                            }
                            catch (err) { }
                            await codeTourApi.startTourByUri(uri, 0);
                            await codeTourApi.startTourByUri(uri, step - 1);
                            // await codeTourApi.startTourByUri(uri, step - 1);
                            //codeTourApi.startTourByUri(uri, step - 1);
                            //codeTourApi.endCurrentTour();
                        }
                    }
                    catch (err) {
                        console.log(err);
                    }
                    break;
                    return;
            }
        }, undefined);
    }
    //resolveWebviewView handles editor callback functions and basic html render
    async resolveWebviewView(webviewView, context, _token) {
        this._view = webviewView;
        //setup webview
        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };
        //ensure that user has opened a project before continuing
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showInformationMessage("Open a folder/workspace first");
            return;
        }
        //set base path of workspace for future file handling 
        this.baseWorkspaceUri = vscode.workspace.workspaceFolders[0].uri;
        this.baseWorkspaceUri.fsPath.replace("file://", "");
        if (this._view) {
            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._getCurrentPage(this._view.webview);
            await this._getHtmlForWebview(this._view.webview, "");
        }
        //callback for registered commands
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case "hello":
                    //display message when hello command is called
                    vscode.window.showInformationMessage(data.text);
                    return;
            }
        });
    }
    //addColor sends color message to messsage handler
    addColor() {
        if (this._view) {
            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.postMessage({ type: 'addColor' });
        }
    }
    //clearColors sends color message to clear colors to message handler
    clearColors() {
        if (this._view) {
            this._view.webview.postMessage({ type: 'clearColors' });
        }
    }
    //_getHtmlForWebview renders afk enbaled and disabled pages
    async _getHtmlForWebview(webview, group) {
        {
            await this._getHtml(webview, group);
        }
    }
    //findMDFiles finds all markdown files in the workspace folder
    async findMDFiles() {
        var mdArr = [];
        try {
            const fs = require('fs');
            const markdown = require('markdown-it');
            const shiki = require('shiki');
            var md;
            //use shikit to render markdown syntax and get all markdown files
            await shiki.getHighlighter({
                theme: 'github-dark'
            }).then((highlighter) => {
                //render markdown with shiki highlighter
                const md = markdown({
                    html: true,
                    highlight: (code, lang) => {
                        return highlighter.codeToHtml(code, { lang });
                    }
                });
                //get path to tutorial
                let tuitotialPaths = this.baseWorkspaceUri.fsPath + "/.tutorials/";
                //get all README files from file path and push to markdown array
                fs.readdir(tuitotialPaths, (err, files) => {
                    files.forEach((f) => {
                        if (f.endsWith(".md") && f.indexOf("tutorial-") !== -1) {
                            var numberPattern = /\d+/g;
                            ;
                            let tutorialNum = f.match(numberPattern)[0];
                            if (tutorialNum) {
                                mdArr[tutorialNum - 1] = md.render(fs.readFileSync(`${tuitotialPaths}${f}`, 'utf-8'));
                            }
                        }
                    });
                });
            });
        }
        catch (err) {
            console.log(err);
        }
        //return markdown array
        return await mdArr;
    }
    getCodeTours() {
        const fs = require('fs');
        var ctArr = [];
        var numberPattern = /\d+/g;
        ;
        let tourPaths = this.baseWorkspaceUri.fsPath + "/.tours/";
        fs.readdir(tourPaths, (err, files) => {
            files.forEach((f) => {
                if (f.endsWith(".tour") && f.indexOf("tutorial-") !== -1) {
                    let tourNum = f.match(numberPattern)[0];
                    if (tourNum) {
                        let tour = fs.readFileSync(`${tourPaths}${f}`, 'utf-8');
                        let ts = JSON.parse(tour).steps;
                        this.tourSteps[tourNum - 1] = ts.length;
                        ctArr[tourNum - 1] = f;
                    }
                }
            });
        });
        return ctArr;
    }
    getUri(webview, extensionUri, pathList) {
        return webview.asWebviewUri(vscode_1.Uri.joinPath(extensionUri, ...pathList));
    }
    //renderBottomButtons renders the pagination buttons on the bottom of the page
    renderBottomButtons(currentPgNum) {
        let bottomPages = "";
        //if the current page number is more than 8
        if (currentPgNum > 8) {
            //set the max number of displayed pages to be the next number above the current divisible by 8
            this.maxPages = (currentPgNum + 8) - ((currentPgNum + 8) % 8);
            //set the min number to be the next number below the current divisible by 8
            this.minPages = currentPgNum - (currentPgNum % 8);
        }
        //add last group button to return to the last grouping of 8 pages
        let lastGroup = `<button class="pageButton" name="lastPageGroup" onclick="lastGroup()"><</button>`;
        //add next page group button to proceed to the next grouping of 8 pages
        let nextGroup = `<button class="pageButton" name="nextPageGroup" onclick="nextGroup()">></button>`;
        //if the current page number is less than 8
        if (currentPgNum < 8) {
            //disable the last group button as there are no groups before this
            lastGroup = `<button disabled class="pageButton" name="lastPageGroup" onclick="lastGroup()"><</button>`;
            //set the range to be 1-8
            this.maxPages = 8;
            this.minPages = 1;
        }
        //add last group button to page render
        bottomPages += lastGroup;
        //if the current page number is divisible by 8 and that number is not 1 or 0
        if ((currentPgNum % 8 === 0) && (currentPgNum > 1)) {
            //add 8 to the max range and set the min range to be the current number
            this.maxPages = currentPgNum + 8;
            this.minPages = currentPgNum;
        }
        //if the max of the range has exceeded the number of markdown files
        if (this.maxPages >= this.numOfTutorials) {
            //set the max range to the number of markdown files
            this.maxPages = this.numOfTutorials;
            //disable the next group button as there are no groups after this
            nextGroup = `<button disabled class="pageButton" name="nextPageGroup" onclick="nextGroup()">></button>`;
        }
        //iterate from the minPage to the maxPage and add a pagination button for each number in the range
        for (let i = this.minPages; i <= this.maxPages; i++) {
            if (i === currentPgNum) {
                bottomPages += `<button disabled current class="pageButton" onclick="page(${i})" name="page-${i}">${i}</button>\n`;
                continue;
            }
            bottomPages += `<button class="pageButton" onclick="page(${i})" name="page-${i}">${i}</button>\n`;
        }
        //if the current page number is greater than or equal to the number of markdown files
        if (currentPgNum >= this.numOfTutorials) {
            //disable the next page group button as there are no groups after this
            nextGroup = `<button disabled class="pageButton" name="nextPageGroup" onclick="nextGroup()">></button>`;
        }
        // //add next page group button to proceed to the next grouping of 8 pages
        bottomPages += nextGroup;
        //set html to page button variable to be added to page later
        this.pageButtonsHTML = bottomPages;
    }
    //nextPageGroup reRenders only the bottom pagination buttons to allow the user to scroll to the next grouping without changing pages
    nextPageGroup(currentPgNum) {
        let bottomPages = "";
        this.minPages = (this.maxPages) - (this.maxPages) % 8;
        if (this.minPages < 0) {
            this.minPages = 1;
        }
        //set the min pages to the old max
        //this.minPages = this.maxPages;
        //set the maxpages to the next page number divisible by 8
        this.maxPages = (this.maxPages + 8) - (this.maxPages + 8) % 8;
        //last group button allows user to scroll back to the last grouping of 8 pages
        let lastGroup = `<button class="pageButton" name="lastPageGroup" onclick="lastGroup()"><</button>`;
        //add last group button to the page
        bottomPages += lastGroup;
        //next group button allows user to scroll to the next grouping of 8 pages
        let nextGroup = `<button class="pageButton" name="nextPageGroup" onclick="nextGroup()">></button>`;
        //if the max pages has exceeded the number of markdown files
        if (this.maxPages >= this.numOfTutorials) {
            //disable the next group button
            nextGroup = `<button disabled class="pageButton" name="nextPageGroup" onclick="nextGroup()">></button>`;
            //set the max pages to the number of markdown files
            this.maxPages = this.numOfTutorials;
        }
        //iterate over the range from minPages to maxPages and create the page buttons
        for (let i = this.minPages; i <= this.maxPages; i++) {
            //when the currently displayed markdown is reached, disbaled the page button for it
            if (i === currentPgNum) {
                bottomPages += `<button disabled current class="pageButton" onclick="page(${i})" name="page-${i}">${i}</button>\n`;
                continue;
            }
            //add the page button to the page
            bottomPages += `<button class="pageButton" onclick="page(${i})" name="page-${i}">${i}</button>\n`;
        }
        //if the current page is the last page
        if (currentPgNum >= this.numOfTutorials) {
            //disabled the next group button
            nextGroup = `<button disabled class="pageButton" name="nextPageGroup" onclick="nextGroup()">></button>`;
        }
        //add the next group button to the page
        bottomPages += nextGroup;
        //set the page button member variable to be the html generated in this function
        this.pageButtonsHTML = bottomPages;
    }
    //lastPageGroup reRenders only the bottom pagination buttons to allow the user to scroll to the last grouping without changing pages
    lastPageGroup(currentPageNum) {
        let bottomPages = "";
        //set the max number pages to the old minimum number of pages
        this.maxPages = this.minPages;
        //subtract 8 from the min number of pages
        this.minPages = this.minPages - 8;
        //create last page button and next page button for pagination of the last and next grouping of 8 respectively
        let lastGroup = `<button class="pageButton" name="lastPageGroup" onclick="lastGroup()"><</button>`;
        let nextGroup = `<button class="pageButton" name="nextPageGroup" onclick="nextGroup()">></button>`;
        //if the min number of pages is less than 1 
        if (this.minPages <= 0) {
            //set the number of pages to 1
            this.minPages = 1;
            //disable the last group button
            lastGroup = `<button disabled class="pageButton" name="lastPageGroup" onclick="lastGroup()"><</button>`;
        }
        //if the max pages is less than or equal to 8
        if (this.maxPages <= 8) {
            //disable the last group button
            lastGroup = `<button disabled class="pageButton" name="lastPageGroup" onclick="lastGroup()"><</button>`;
            if (this.numOfTutorials >= 8) {
                this.maxPages = 8;
            }
        }
        //add the last group button to the page
        bottomPages += lastGroup;
        //iterate over the range of minPages to maxPages and add the page buttons
        for (let i = this.minPages; i <= this.maxPages; i++) {
            //when the current page number is reached
            if (i === currentPageNum) {
                //disable the current page button
                bottomPages += `<button disabled class="pageButton" onclick="page(${i})" name="page-${i}">${i}</button>\n`;
                continue;
            }
            //add the page button to the page
            bottomPages += `<button class="pageButton" onclick="page(${i})" name="page-${i}">${i}</button>\n`;
        }
        //ad the next group button to the page
        bottomPages += nextGroup;
        //set the page buttons to the member variable for the bottom of the page
        this.pageButtonsHTML = bottomPages;
    }
    //_getAfkDisabledHtml renders page for when afk is disabled
    //takes in a group string to determine whether to render the whole page or
    //to just render the next and last group page controls
    async _getHtml(webview, group) {
        //get markdown files
        let mds = await this.findMDFiles();
        let cts = this.getCodeTours();
        //init packages
        const fs = require('fs');
        const markdown = require('markdown-it');
        const shiki = require('shiki');
        //get shiki highlighter
        shiki.getHighlighter({
            theme: 'github-dark'
        }).then((highlighter) => {
            const md = markdown({
                html: true,
                highlight: (code, lang) => {
                    return highlighter.codeToHtml(code, { lang });
                }
            });
            var currentPgNum;
            //check if tutorial config exists and get current page number
            try {
                //if tutorial config exists get current page number from it
                if (fs.existsSync(this.baseWorkspaceUri.fsPath + "/.gigo/tutorial/.tutorial_config.json")) {
                    let obj = JSON.parse(fs.readFileSync(this.baseWorkspaceUri.fsPath + "/.gigo/tutorial/.tutorial_config.json", 'utf8'));
                    currentPgNum = obj.currentPageNum;
                }
                else {
                    //if tutorial config does not exist create it and set current page number to 1
                    let yamlContent = "{\"currentPageNum\": 1}";
                    fs.writeFileSync(this.baseWorkspaceUri.fsPath + "/.gigo/tutorial/.tutorial_config.json", yamlContent);
                    currentPgNum = 1;
                }
            }
            catch (err) {
                console.log(err);
                return;
            }
            //html of previous button
            var previousButton = `<button class="enable-gigo-tutorial-previous-button">Previous Tutorial</button>`;
            //if current page number is 1 disable previoous button
            if (currentPgNum === 1) {
                previousButton = ` <button disabled class="enable-gigo-tutorial-previous-button">Previous Tutorial</button>`;
            }
            //html of next button
            var nextButton = `<button class="enable-gigo-tutorial-next-button">Next Tutorial</button>`;
            //if current page number is last page disable next button
            if (currentPgNum >= mds.length) {
                nextButton = `<button disabled class="enable-gigo-tutorial-next-button">Next Tutorial</button>`;
            }
            //set current index to bed 1 less than current page
            let index = currentPgNum - 1;
            // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
            const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'tutorial', 'buttons_tutorial.js'));
            // Do the same for the stylesheet.
            const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'tutorial', 'reset_tutorial.css'));
            const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'tutorial', 'vscode_tutorial.css'));
            const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'tutorial', 'main_tutorial.css'));
            // Use a nonce to only allow a specific script to be run.
            const nonce = getNonce();
            //set the number of tutorials to the current number of markdown files matching the preset formatting
            this.numOfTutorials = mds.length;
            let codeTourButton = "";
            if (cts[index]) {
                codeTourButton = ` <div class="codeTourLink">
                    <button id="codeTour" class="codeTourButton" onclick="startCodeTour(${currentPgNum})">Start CodeTour</button>
                </div>`;
                if (mds[index].indexOf("@@@")) {
                    var numberPattern = '@@@.*([Ss][Tt][Ee][Pp]).*(?<step_number>\\d+).*@@@';
                    let stepNumber = [...mds[index].matchAll(numberPattern)];
                    for (let i = 0; i < stepNumber.length; i++) {
                        if (stepNumber[i][2] > this.tourSteps[index]) {
                            continue;
                        }
                        let stepButton = ` <div class="codeTourStep">
                        <button id="codeStep${stepNumber[i][2]}" class="codeTourStep" onclick="startCodeTour(${currentPgNum}, ${stepNumber[i][2]})">Interactive Step ${stepNumber[i][2]}</button>
                    </div>`;
                        mds[index] = mds[index].replace(stepNumber[i][0], stepButton);
                    }
                }
            }
            //group control
            switch (group) {
                //render the next group page buttons
                case "next":
                    this.nextPageGroup(currentPgNum);
                    break;
                //render the last group page buttons
                case "last":
                    this.lastPageGroup(currentPgNum);
                    break;
                //if no string is input or an unrecognized string is passed
                //render the page normally
                default:
                    this.renderBottomButtons(currentPgNum);
                    break;
            }
            if (mds[index] === undefined) {
                mds[index] = "For a more interactive experience add tutorials for others to view.";
            }
            if (this._view) {
                //render the html for the page by passing it to the view
                this._view.webview.html = `<!DOCTYPE html>
			<html lang="en">
            <input name="currentPgNum" type="hidden" value="${currentPgNum}"></input>
            <input name="maxPageNum" type="hidden" value="${mds.length}"></input>
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading styles from our extension directory,
					and only allow scripts that have a specific nonce.
					(See the 'webview-sample' extension sample for img-src content security policy examples)
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				<title>GIGO AFK Session</title>
			</head>
            ${codeTourButton}
            <div id="big">
                ${mds[index]}
            </div>
			<body>
                <br/>
                <br/>
                <div id="nextButton">
                    ${nextButton}
                </div>
                <div id="previousButton">
                    ${previousButton}
                </div>
                <br/>
                <br/>
                <div class="pageButtonContainer">
                    ${this.pageButtonsHTML}
                </div>
               
			</body>

            <style>
                :root {
                    --shiki-color-text: #EEEEEE;
                    --shiki-color-background: #333333;
                    --shiki-token-constant: #660000;
                    --shiki-token-string: #770000;
                    --shiki-token-comment: #880000;
                    --shiki-token-keyword: #990000;
                    --shiki-token-parameter: #AA0000;
                    --shiki-token-function: #BB0000;
                    --shiki-token-string-expression: #CC0000;
                    --shiki-token-punctuation: #DD0000;
                    --shiki-token-link: #EE0000;
                }
                </style>
                        
            <script nonce="${nonce}" src="${scriptUri}"></script>
           
			</html>`;
            }
        });
    }
}
TutorialWebViewprovider.viewType = 'gigo.tutorialView';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=webview.js.map