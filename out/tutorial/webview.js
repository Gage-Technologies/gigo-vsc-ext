"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorialWebViewprovider = exports.activateTutorialWebView = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
const path = require("path");
const yaml = require("js-yaml");
//activateAfkWebview is called upon extension start and registers necessary commands for afk functionality
async function activateTutorialWebView(context, logger) {
    //register afk provider by calling class constructor
    const provider = new TutorialWebViewprovider(context.extensionUri, logger);
    function createTutorialFile() {
        const fs = require('fs');
        return new Promise((resolve, reject) => {
            const tutorialFolderPath = path.join(provider.baseWorkspaceUri.fsPath, '.gigo', '.tutorials');
            fs.readdir(tutorialFolderPath, (err, files) => {
                if (err) {
                    reject(err);
                    return;
                }
                // Find the highest tutorial number
                let highestNumber = 0;
                files.forEach((file) => {
                    if (file.startsWith('tutorial-')) {
                        const number = parseInt(file.substring(9));
                        if (number > highestNumber) {
                            highestNumber = number;
                        }
                    }
                });
                // Increment the highest number to get the next tutorial number
                const nextNumber = highestNumber + 1;
                // create tour file to record steps and line numbers
                const newTourFileName = `tour-${nextNumber}.yaml`;
                const newTourFilePath = path.join(tutorialFolderPath, newTourFileName);
                fs.writeFile(newTourFilePath, 'steps: []', (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    // Create the new tutorial markdown file
                    const newTutorialFileName = `tutorial-${nextNumber}.md`;
                    const newTutorialFilePath = path.join(tutorialFolderPath, newTutorialFileName);
                    fs.writeFile(newTutorialFilePath, `##### Use this markdown for your tutorial ${nextNumber} text \n\n\n\n`, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                    });
                    const tourFilePath = path.join(provider.baseWorkspaceUri.fsPath, ".gigo", ".tours", `tutorial-${nextNumber}.tour`);
                    // create codetour file for the new tutorial
                    if (fs.existsSync(tourFilePath)) {
                        let tour = fs.readFileSync(tourFilePath, 'utf-8');
                        let ts = JSON.parse(tour).steps;
                        let numOfSteps = ts.length;
                        let fullTour = JSON.parse(tour);
                    }
                    else {
                        var obj = {
                            $schema: "https://aka.ms/codetour-schema",
                            title: `tutorial-${nextNumber}.tour`,
                            steps: [],
                            ref: "master",
                        };
                        fs.writeFileSync(tourFilePath, JSON.stringify(obj), 'utf-8');
                    }
                    // open the new file in editor and tutorial viewer 
                    vscode.commands.executeCommand('vscode.openWith', vscode_1.Uri.file(newTutorialFilePath), "gigo.editor");
                    provider._view?.webview.postMessage({ type: 'openPage', message: nextNumber });
                    if (nextNumber === 1) {
                        vscode.commands.executeCommand('workbench.action.reloadWindow');
                        provider._view?.webview.postMessage({ type: 'openPage', message: 1 });
                    }
                });
            });
        });
    }
    // register a command to create a new tutorial
    vscode.commands.registerCommand('gigo.testing', () => {
        createTutorialFile();
    });
    // register a command to open a tutorial for editing
    vscode.commands.registerCommand('gigo.edit', () => {
        const tutorialFolderPath = path.join(provider.baseWorkspaceUri.fsPath, '.gigo', '.tutorials');
        const tutorialFileName = `tutorial-${provider.currentPageNum}.md`;
        const tutorialFilePath = path.join(tutorialFolderPath, tutorialFileName);
        vscode.commands.executeCommand('vscode.openWith', vscode_1.Uri.file(tutorialFilePath), "gigo.editor");
    });
    // register a command to delete the current tutorial
    vscode.commands.registerCommand('gigo.delete', () => {
        const fs = require('fs');
        const path = require('path');
        const tourFolderPath = path.join(provider.baseWorkspaceUri.fsPath, '.gigo', '.tours');
        const tutorialFolderPath = path.join(provider.baseWorkspaceUri.fsPath, '.gigo', '.tutorials');
        // popup for deletion confirmation
        vscode.window.showInformationMessage('Are you sure you want to delete this tutorial?', 'Yes', 'No').then((selected) => {
            if (selected === 'Yes') {
                const currentPageNum = provider.currentPageNum;
                // delete all the files associated with the current tutorial
                fs.unlink(path.join(tutorialFolderPath, `tutorial-${currentPageNum}.md`), (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
                fs.unlink(path.join(tutorialFolderPath, `tour-${currentPageNum}.yaml`), (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
                fs.unlink(path.join(tourFolderPath, `tutorial-${currentPageNum}.tour`), (err) => {
                    if (err) {
                        console.error(err);
                        return;
                    }
                });
                // rename the files after the deleted one
                function renameFiles(folderPath, currentPageNum, prefix) {
                    fs.readdir(folderPath, (err, files) => {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        files.sort().forEach((file) => {
                            const match = file.match(new RegExp(`${prefix}-(\\d+)\\.`));
                            if (match) {
                                const num = parseInt(match[1]);
                                if (num > currentPageNum) {
                                    const newFileName = `${prefix}-${num - 1}.${file.split('.')[1]}`;
                                    fs.rename(path.join(folderPath, file), path.join(folderPath, newFileName), (err) => {
                                        if (err) {
                                            console.error(err);
                                        }
                                    });
                                }
                            }
                        });
                    });
                }
                // Use the function for both folders
                renameFiles(tutorialFolderPath, currentPageNum, 'tutorial');
                renameFiles(tutorialFolderPath, currentPageNum, 'tour');
                renameFiles(tourFolderPath, currentPageNum, 'tutorial');
                // open previous page in tutorial viewer for consistency
                if (currentPageNum > 1) {
                    provider._view?.webview.postMessage({ type: 'openPage', message: currentPageNum - 1 });
                }
                else {
                    provider._view?.webview.postMessage({ type: 'openPage', message: 1 });
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            }
        });
    });
    if (provider.codeTour) {
        provider.codeTour.activate();
    }
    //push and regsitser necessary commands
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(TutorialWebViewprovider.viewType, provider));
}
exports.activateTutorialWebView = activateTutorialWebView;
//afk webview provider has basic functions for handling afk system
class TutorialWebViewprovider {
    constructor(_extensionUri, sysLogger) {
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
        this.logger = sysLogger;
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
                        fs.writeFileSync(this.configPath, yamlContent);
                        //render page with current page number as main page
                        if (this._view) {
                            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
                            await this._getHtmlForWebview(this._view.webview, "");
                        }
                    }
                    catch (err) {
                        this.logger.error.appendLine(`Tutorial Failed: Failed to change pages in tutorial view: ${err}`);
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
                        this.logger.error.appendLine(`Tutorial Failed: Failed to change to next group in tutorial view: ${err}`);
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
                        this.logger.error.appendLine(`Tutorial Failed: Failed to change to last page in tutorial view: ${err}`);
                        console.log(err);
                    }
                    break;
                case "startCodeTour":
                    try {
                        if (this.codeTour) {
                            const codeTourApi = this.codeTour.exports;
                            let uri = vscode.Uri.file(`${this.baseWorkspaceUri.fsPath}/.gigo/.tours/tutorial-${message.text}.tour`);
                            codeTourApi.startTourByUri(uri);
                        }
                    }
                    catch (err) {
                        this.logger.error.appendLine(`Tutorial Failed: Failed to start code tour in tutorial view: ${err}`);
                        console.log(err);
                    }
                    break;
                case "startCodeTourStep":
                    try {
                        const step = message.step;
                        if (this.codeTour) {
                            const codeTourApi = this.codeTour.exports;
                            let uri = vscode.Uri.file(`${this.baseWorkspaceUri.fsPath}/.gigo/.tours/tutorial-${message.text}.tour`);
                            try {
                                await codeTourApi.endCurrentTour();
                            }
                            catch (err) {
                                this.logger.error.appendLine(`Tutorial Failed: Failed partial execution fo code tour step in tutorial view: ${err}`);
                            }
                            await codeTourApi.startTourByUri(uri, 0);
                            await codeTourApi.startTourByUri(uri, step - 1);
                            await codeTourApi.startTourByUri(uri, step - 1);
                        }
                    }
                    catch (err) {
                        this.logger.error.appendLine(`Tutorial Failed: Failed to start code tour step in tutorial view: ${err}`);
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
            this.logger.error.appendLine(`Tutorial Failed: Failed to start tutorial, a workspace must be open`);
            return;
        }
        //set base path of workspace for future file handling 
        this.baseWorkspaceUri = vscode.workspace.workspaceFolders[0].uri;
        this.baseWorkspaceUri.fsPath.replace("file://", "");
        const path = require('node:path');
        this.configPath = path.join(this.baseWorkspaceUri.fsPath, ".gigo/tutorial/.tutorial_config.json");
        this.configFoldr = path.join(this.baseWorkspaceUri.fsPath, ".gigo/tutorial");
        if (this._view) {
            this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._getCurrentPage(this._view.webview);
            await this._getHtmlForWebview(this._view.webview, "");
        }
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
                let tuitotialPaths = this.baseWorkspaceUri.fsPath + "/.gigo" + "/.tutorials/";
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
            this.logger.error.appendLine(`Tutorial Failed: Failed to start tutorial, a workspace must be open`);
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
        let tourPaths = this.baseWorkspaceUri.fsPath + "/.gigo" + "/.tours/";
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
                if (fs.existsSync(this.configPath)) {
                    let obj = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
                    currentPgNum = obj.currentPageNum;
                    this.logger.info.appendLine(`Tutorial: Loaded tutorial config.`);
                }
                else {
                    //if tutorial config does not exist create it and set current page number to 1
                    let yamlContent = "{\"currentPageNum\": 1}";
                    if (!fs.existsSync(this.configFoldr)) {
                        fs.mkdirSync(this.configFoldr);
                    }
                    fs.writeFileSync(this.configPath, yamlContent);
                    currentPgNum = 1;
                    this.logger.info.appendLine(`Tutorial: Created new tutorial config.`);
                }
            }
            catch (err) {
                this.logger.error.appendLine(`Tutorial Failed: Failed to open/create tutorial config: ${err}`);
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
            const config = vscode.workspace.getConfiguration();
            const themeName = config.get('workbench.colorTheme');
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
            // setup the filepaths for reading the yaml and markdown files for the tutorials
            let filePath = path.join(this.baseWorkspaceUri.fsPath, "/.gigo" + `/.tutorials/tour-${currentPgNum}.yaml`);
            let fileContents = "steps: []";
            if (fs.existsSync(filePath)) {
                fileContents = fs.readFileSync(filePath, 'utf8');
            }
            else {
                fileContents = "steps: []";
            }
            let yamlData = yaml.load(fileContents);
            const mdFilePath = path.join(this.baseWorkspaceUri.fsPath + "/.gigo" + `/.tutorials/tutorial-${currentPgNum}.md`); // Replace with the actual file path
            // load the markdown content 
            let markdownContent = fs.readFileSync(mdFilePath, 'utf-8');
            // load the markdown content using the shiki highlighter
            let markdownData = md.render(markdownContent);
            // get the default themes for the buttons
            let currentTheme = "var(--vscode-button-hoverBackground)";
            let boxTheme = "0 7px 0px var(--vscode-button-background)";
            let activeBoxTheme = "0 2px 0px var(--vscode-button-background)";
            // if using premium theme, assign new styling to match the theme better
            if (themeName === 'Sam Custom Theme') {
                currentTheme = "#41c18c";
                boxTheme = "0 7px 0px #1c8762";
                activeBoxTheme = "0 2px 0px #1c8762";
            }
            // iterate through the yaml data to get the steps for each tutorial and place the buttons in the right places on the viewer
            function getSteps(fileContents) {
                let yamlData = yaml.load(fileContents);
                for (let step of yamlData.steps) {
                    let buttonHtml = `<br><div class="btn-9" style="background: ${currentTheme}; box-shadow: ${boxTheme}; " id="codeStep${step.step_number}" onclick="startCodeTour(${currentPgNum}, ${step.step_number})" onmousedown="this.style.boxShadow = '${activeBoxTheme}'" onmouseup="this.style.boxShadow = '${boxTheme}'">Step ${step.step_number}</div><br>`;
                    let lineIndex = step.line_number - 1; // Convert line number to zero-based index
                    let lines = markdownContent.split('\n');
                    lines[lineIndex] = buttonHtml; // Replace the line with the button HTML
                    markdownContent = lines.join('\n');
                    markdownData = md.render(markdownContent);
                    webview.postMessage({ type: 'updateMarkdown', message: md.render(markdownContent) });
                }
            }
            if (fs.existsSync(filePath)) {
                // watch for changes to the yaml file and update the buttons accordingly
                fs.watch(filePath, (eventType) => {
                    if (eventType === 'change') {
                        fileContents = fs.readFileSync(filePath, 'utf-8');
                        if (yamlData !== undefined) {
                            getSteps(fileContents);
                        }
                    }
                });
            }
            // watch for changes to the markdown file and update the buttons accordingly
            fs.watch(mdFilePath, (eventType) => {
                if (eventType === 'change') {
                    markdownContent = fs.readFileSync(mdFilePath, 'utf-8');
                    if (yamlData !== undefined) {
                        getSteps(fileContents);
                    }
                }
                webview.postMessage({ type: 'updateMarkdown', message: md.render(markdownContent) });
            });
            if (yamlData !== undefined) {
                getSteps(fileContents);
            }
            this.currentPageNum = currentPgNum;
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
                this.logger.info.appendLine(`Tutorial: No tutorials found in workspace.`);
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
            <style>
            body {
            min-width: 200px;
            }
            </style>
			<body>
            <div id="big">
            ${markdownData}
            </div>
            <script>
            window.addEventListener('message', event => {
                const message = event.data;
                    if (message.type === 'updateMarkdown') {
                        const markdownData = message.message;
                        document.getElementById('big').innerHTML = markdownData;
                    }
                    if (message.type ==='openPage') {
                        page(message.message)
                    }
                });
            </script>
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
exports.TutorialWebViewprovider = TutorialWebViewprovider;
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