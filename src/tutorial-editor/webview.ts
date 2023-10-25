import path = require('path');
import { stringify } from 'querystring';
import { cachedDataVersionTag } from 'v8';
import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

export async function activateEditor(context: vscode.ExtensionContext) {
    // Register our custom editor providers
    context.subscriptions.push(TutorialEditorProvider.register(context));

}


export class TutorialEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new TutorialEditorProvider(context);
        const options = { suppportsMultipleEditorsPerDocument: false, webviewOptions: { enableScripts: true, retainContextWhenHidden: true } };
        const providerRegistration = vscode.window.registerCustomEditorProvider(TutorialEditorProvider.viewType, provider, options);
        return providerRegistration;
    }

    public text: any;
    public addCodeTourBtn: any = `<button class="add-code-tour" onclick="addCodeTour()">Create Code Tour</button>`;
    private static readonly viewType = 'gigo.editor';

    public updateCounter: number = 0;
    public baseWorkspaceUri!: vscode.Uri;
    public codeTourSteps: string[] = [];
    public numOfSteps: number = 0;
    public moveSVG: any;
    public trashOpen = `<svg disabled="true" class="trash-icon-open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<path class="trash-icon-path" d="M9 13v6c0 .552-.448 1-1 1s-1-.448-1-1v-6c0-.552.448-1 1-1s1 .448 1 1zm7-1c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm-4 0c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm4.333-8.623c-.882-.184-1.373-1.409-1.189-2.291l-5.203-1.086c-.184.883-1.123 1.81-2.004 1.625l-5.528-1.099-.409 1.958 19.591 4.099.409-1.958-5.667-1.248zm4.667 4.623v16h-18v-16h18zm-2 14v-12h-14v12h14z"/>
	</svg>`;
    public tourFilePath: string = "";
    public fullTour: any;
    public fileNum!: number;
    public currentColor: any = "rgb(0,0,0)";

    constructor(
        private readonly context: vscode.ExtensionContext
    ) { this.text = ""; }

    public cursorPos: any;
    /**
     * Called when our custom editor is opened.
     * 
     * 
     */
    public async resolveCustomTextEditor(
        document: vscode.TextDocument,
        webviewPanel: vscode.WebviewPanel,
        _token: vscode.CancellationToken
    ): Promise<void> {


        //ensure that user has opened a project before continuing
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showInformationMessage("Open a folder/workspace first");
            return;
        }

        this.baseWorkspaceUri = vscode.workspace.workspaceFolders[0].uri;
        this.baseWorkspaceUri.fsPath.replace("file://", "");
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true
        };

        let fs = require('fs')

        var files = document.fileName.split("/");
        var fileName = files[files.length - 1];
        var fileNoExt = fileName.split(".")[0];
        this.fileNum = Number(fileNoExt.split("-")[1]);

        this.tourFilePath = path.join(this.baseWorkspaceUri.fsPath, ".gigo", ".tours", `${fileNoExt}.tour`);

        if (fs.existsSync(this.tourFilePath)) {
            let tour = fs.readFileSync(this.tourFilePath, 'utf-8');
            let ts = JSON.parse(tour).steps;
            this.numOfSteps = ts.length;
            this.fullTour = JSON.parse(tour);
        } else {
            var obj = {
                $schema: "https://aka.ms/codetour-schema",
                title: fileNoExt,
                steps: [],
                ref: "master",
            };
            this.fullTour = JSON.stringify(obj);

            fs.writeFileSync(this.tourFilePath, this.fullTour, 'utf-8');
        }

        this.text = document.getText();
        // use regex to replace any escaped characters (\x) within a string (single or double quotes) with a double escaped character (\\)
        // this will ensure that the markdown content has all of its line breaks preserved when rendered by markdown-it
        this.text = this.text.replace(/```[\s\S]*?```/g, function(match: string) {
            console.log("detected triple code block: ", match)
            return match.replace(/(["'])(?:\\.|[^\1])*?\1/g, function(innerMatch: string) {
                return innerMatch.replace(/\\(.?)/g, '\\\\$1');
            });
        });   
        this.text = this.text.replace(/`[^`]*` /g, function(match: string) {
            console.log("detected code block: ", match)
            return match.replace(/(["'])(?:\\.|[^\1])*?\1/g, function(innerMatch: string) {
                console.log("detected internal string: ", innerMatch)
                return innerMatch.replace(/\\(.?)/g, '\\\\$1');
            });
        }); 

        function updateWebview() {
            webviewPanel.webview.postMessage({
                type: 'update',
                text: document.getText(),
            });
        }

        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
        this.moveSVG = webviewPanel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'move_icon_2.svg'));
        vscode.window.onDidChangeActiveColorTheme(() => {
            webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);


        });




        // Hook up event handlers so that we can synchronize the webview with the text document.
        //
        // The text document acts as our model, so we have to sync change in the document to our
        // editor and sync changes in the editor back to the document.
        // 
        // Remember that a single text document can also be shared between multiple custom
        // editors (this happens for example when you split a custom editor)

        const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.toString() === document.uri.toString()) {
                updateWebview();
            }
        });


        // Make sure we get rid of the listener when our editor is closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });

        const processFile = (filePath: string) => {
            if (!fs.existsSync(filePath)) {
                return;
            }
        
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const tourData = yaml.load(fileContents) as any;
        
            if (tourData === undefined) {
                const data = {
                    steps: [
                        {
                            step_number: 1,
                            line_number: this.cursorPos,
                        },
                    ],
                };
        
                const yamlStr = yaml.dump(data);
                fs.writeFileSync(filePath, yamlStr);
            } else {
                this.numOfSteps = tourData.steps.length;
        
                let newLineNum = this.cursorPos; // new line number to push
                let lineNumExists = true;
        
                // Check if the new line number already exists and increment if necessary
                while (lineNumExists) {
                    lineNumExists = false;
                    for (let i = 0; i < tourData.steps.length; i++) {
                        if (tourData.steps[i].line_number === newLineNum) {
                            newLineNum++;
                            lineNumExists = true;
                            break;
                        }
                    }
                }
        
                // Push the new step to the steps array
                tourData.steps.push({
                    step_number: this.numOfSteps + 1,
                    line_number: newLineNum
                });
        
                // Write the updated YAML back to the file
                const tourDataStr = yaml.dump(tourData);
                fs.writeFileSync(filePath, tourDataStr);
        
                this.numOfSteps = this.numOfSteps + 1;
            }
        }

        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'syntaxHighlight':
                    var Prism = require('prismjs');
                    Prism.highlightElement(e.message);
                    return;
                case 'updateFile':
                    // when using the tutorial editor, updates the file so that it can be saved and reflected in webview
                    this.updateCounter++;
                    this.text = e.message;
                    try {
                        fs.writeFileSync(document.fileName, this.text, 'utf-8');
                    } catch (err) {
                        vscode.window.showInformationMessage(`error in file write ${err}`);
                    }
                    return;
                case "cursorPosition":
                    if (e.message !== undefined) {
                        this.cursorPos = e.message["lineNumber"];
                    }
                    return;
                return;

                case 'saveTourStep':
                    // create file path to save the steps to the tour .yaml file
                    const filePath = path.join(this.baseWorkspaceUri.fsPath, "/.gigo" + `/.tutorials/tour-${this.fileNum}.yaml`);
                    let tour = fs.readFileSync(this.tourFilePath, 'utf-8');
                    let ts = JSON.parse(tour);

                    // parse the file to get the steps and line numbers currently in the tour
                    let parsedMsg = JSON.parse(e.message);
                    parsedMsg.line = parseInt(parsedMsg.line);
                    var stepNum = parseInt(parsedMsg.step);
                    delete parsedMsg['step'];

                    // load the color from the tour file 
                    this.currentColor = this.rgbToHex(parsedMsg.color);

                    // check to see if user input line number is valid
                    if (parsedMsg.line < 1) {
                        console.log('incorrect value passed for parsedMsg.line: ', parsedMsg.line);
                        vscode.window.showInformationMessage(`Incorrect line number for step. Please ensure that the line number is greater than 0.`);
                        return;
                    }

                    var doExist = false;

                    try {
                        doExist = fs.existsSync(path.join(this.baseWorkspaceUri.fsPath, parsedMsg.file));

                    } catch (e) {
                        console.log(e);
                    }



                    if (!doExist) {
                        console.log("does exist: ", doExist, " file path: ", path.join(this.baseWorkspaceUri.fsPath, parsedMsg.file));
                        vscode.window.showInformationMessage(`Incorrect file path for step. Please ensure that the file exists and is the relative path to the file.`);
                        return;
                    }


                    const readline = require('readline');

                    var fileP = path.join(this.baseWorkspaceUri.fsPath, parsedMsg.file);
                    var linesCount = 0;
                    var rl = readline.createInterface({
                        input: fs.createReadStream(fileP),
                        output: process.stdout,
                        terminal: false
                    });
                    rl.on('line', function (line: any) {
                        linesCount++; // on each linebreak, add +1 to 'linesCount'
                    });
                    rl.on('close', function () {
                        console.log(linesCount); // print the result when the 'close' event is called
                    });

                    if (parsedMsg > linesCount) {
                        console.log(`number of lines in pass ${parsedMsg.line} is greater than number of lines in file ${linesCount}`);
                        vscode.window.showInformationMessage(`Incorrect line number for step. Please ensure that the line number exists in file.`);
                        return;
                    }


                    if (fs.existsSync(filePath)) {
                        processFile(filePath);
                      } else {
                        const tutorialFolderPath = path.join(this.baseWorkspaceUri.fsPath, '.gigo', '.tutorials');
                        const newTourFileName = `tour-${this.fileNum}.yaml`;
                        const newTourFilePath = path.join(tutorialFolderPath, newTourFileName);
                        fs.writeFile(newTourFilePath, '', (err: any) => {
                            if (err) {
                                console.log(err);
                                return;
                            }
            
                            // Create the new tutorial markdown file
                            const newTutorialFileName = `tutorial-${this.fileNum}.md`;
                            const newTutorialFilePath = path.join(tutorialFolderPath, newTutorialFileName);
                            fs.writeFile(newTutorialFilePath, `##### Use this markdown for your tutorial ${this.fileNum} text \n\n\n\n`, (err: any) => {
                                if (err) {
                                    console.log(err);
                                    return;
                                }
                            });

                            const tourFilePath = path.join(this.baseWorkspaceUri.fsPath, ".gigo", ".tours", `tutorial-${this.fileNum}.tour`);

                            // create codetour file for the new tutorial
                            if (fs.existsSync(tourFilePath)) {
                                let tour = fs.readFileSync(tourFilePath, 'utf-8');
                                let ts = JSON.parse(tour).steps;
                                let numOfSteps = ts.length;
                                let fullTour = JSON.parse(tour);
                            } else {
                                var obj = {
                                    $schema: "https://aka.ms/codetour-schema",
                                    title: `tutorial-${this.fileNum}.tour`,
                                    steps: [],
                                    ref: "master",
                                };
            
                                fs.writeFileSync(tourFilePath, JSON.stringify(obj), 'utf-8');
                            }
                        });
                       processFile(filePath); 
                    }
                      


                    if (stepNum > this.numOfSteps) {
                        this.numOfSteps++;
                        ts.steps.push(parsedMsg);
                    } else {
                        ts.steps[stepNum - 1] = parsedMsg;
                    }

                    this.fullTour = JSON.stringify(ts);

                    try{
                        fs.writeFileSync(this.tourFilePath, this.fullTour, 'utf-8');
                    }catch(err){
                        console.log("failed to save tour steps to: ", this.tourFilePath, err);
                    }
                                        
                    webviewPanel.webview.postMessage({ type: 'placeStep', message: this.currentColor });
                    
                    break;

                case 'deleteTourStep':
                    // post message for the tutorial editor to handle the deletion of the step on the webview
                    webviewPanel.webview.postMessage({ type: 'deleteTourStep' });

                    // load the base 0 step number to delete from tour file 
                    var deletedStepNum = parseInt(e.message) - 1;
                    let tours = fs.readFileSync(this.tourFilePath, 'utf-8');
                    let tss = JSON.parse(tours);
                    tss.steps = tss.steps.filter((_: any, index: number) => index !== deletedStepNum);
                    this.fullTour = JSON.stringify(tss);
                    fs.writeFileSync(this.tourFilePath, this.fullTour, 'utf-8');

                    // setup deletion of the step from the .yaml file
                    const delFilePath = path.join(this.baseWorkspaceUri.fsPath, "/.gigo" + `/.tutorials/tour-${this.fileNum}.yaml`);
                    const deliFleContents = fs.readFileSync(delFilePath, 'utf8');
                    const delTourData = yaml.load(deliFleContents) as any;

                    // load step to delete from the.yaml file
                    const stepToDelete = e.message;

                    // when step is deleted from the.yaml file, decrement the step number and keep the corresponding line number
                    delTourData.steps.splice(stepToDelete-1, 1);
                    for (let i = stepToDelete-1; i < delTourData.steps.length; i++) {
                        delTourData.steps[i].step_number -= 1;
                    }

                    const updatedYaml = yaml.dump(delTourData);

                    fs.writeFileSync(delFilePath, updatedYaml);

                    this.numOfSteps = this.numOfSteps - 1;

                    break;
            }
        });

        updateWebview();
    }
    

    // load the step button color and translate to a hexcode so webview can stay consistent in step creation
    private rgbToHex(rgb: string): string {
        const values = rgb.substring(4, rgb.length - 1).split(",");
      
        const hexValues = values.map((value) => {
          const intValue = parseInt(value.trim(), 10);
          const hexValue = intValue.toString(16).padStart(2, "0");
          return hexValue;
        });
      
        const hexCode = "#" + hexValues.join("");
      
        return hexCode;
      }

    /**
     * Get the static html used for the editor webviews.
     */
    private getHtmlForWebview(webview: vscode.Webview): string {
        const fs = require('fs');
        let tour = fs.readFileSync(this.tourFilePath, 'utf-8');
        this.fullTour = JSON.parse(tour);

        let highlightStyle = `<link id="import-theme" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-dark.css"/>`;

        if (vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light) {
            highlightStyle = `<link id="import-theme" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism.css"/>`;
        }


        // Local path to script and css for the webview


        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'dist', 'tutorial-editor', 'reset.css'));

        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'dist', 'tutorial-editor', 'vscode.css'));


        const styleJS = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'dist', 'tutorial-editor', 'style.js'));

        const codeIn = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'code-input.js'));
        const codeAutoDetect = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'autodetect.min.js'));
        const codeIndent = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'indent.js'));
        const codeComplete = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'autocomplete.js'));
        const codeCompleteStyle = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'autocomplete.css'));
        const codeInStyling = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'code-input.css'));
        const codeDeBounce = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'debounce-update.js'));

        const codeTourScript = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'code-tour.js'));
        const codeTourStyle = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'code-tour.css'));

        const coordsUtil = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'textareaCoords.js'));

        // Get the current theme name from VS Code settings
        const currentTheme = vscode.workspace.getConfiguration().get("workbench.colorTheme");

        // Create a uri for the current theme CSS file
        const uri = vscode.Uri.file(path.join(vscode.env.appRoot, "extensions", "vscode-resource", "themes", `${currentTheme}.css`));

        // Read the contents of the CSS file
        const css = vscode.workspace.fs.readFile(uri);

        // Convert the CSS to a string
        const cssString = css.toString();

        this.moveSVG = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'move_icon_2.svg'));
        const trashPng = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'tutorial-editor', 'trash.png'));

        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        var parsedText = this.text.replace(/["]/g, `\"`);

        const parsedTextEscaped = parsedText.replace(/`/g, '\\`');

        let vsTheme = 'vs';
        if (vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark) {
            vsTheme = 'vs-dark';
        } 

        let tourDataStr = JSON.stringify("");

        const filePath = path.join(this.baseWorkspaceUri.fsPath, "/.gigo" + `/.tutorials/tour-${this.fileNum}.yaml`);
        if (fs.existsSync(filePath)) {
            let fileContents = fs.readFileSync(filePath, 'utf8');
            let tourData = yaml.load(fileContents) as any;
            
            if (tourData !== undefined) {
                tourDataStr = JSON.stringify(tourData);
                this.numOfSteps = tourData.steps.length;
            } else if (tourData === undefined) {
                this.numOfSteps = 0;
            }
          } else {
            console.log('File does not exist');
            this.numOfSteps = 0;
            tourDataStr = JSON.stringify({
                steps: [],
              });
          }

        return /* html */`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">

            <!--
            Use a content security policy to only allow loading images from https or from our extension directory,
            and only allow scripts that have a specific nonce.
            -->
            <meta http-equiv="Content-Security-Policy" default-src * 'unsafe-inline' 'unsafe-eval'; script-src ${webview.cspSource} img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';>

            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <input id="tour-step-num" name="tour-step-num" type="hidden" value="${this.numOfSteps}"></input>
            <input id="tour-path" name="tour-path" type="hidden" value="${this.tourFilePath}"></input>
            <input id="tour-step-objs" name="tour-step-objs" type="hidden" value='${JSON.stringify(this.fullTour.steps)}'></input>

            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css" integrity="sha512-rO+olRTkcf304DQBxSWxln8JXCzTHlKnIdnMUwYvQa9/Jd4cQaNkItIUj6Z4nvW1dqK0SKXLbn9h4KwZTNtAyw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/themes/default.css" integrity="sha512-HPYcuSKzZ/FwxsRKIiNX6imjfnr5+82poiPO+oXi9WCEEe2q1x2OOBpbF+6cRG+hwoEsBXfs7oQveu5yHbY64g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-numbers.min.css" integrity="sha512-cbQXwDFK7lj2Fqfkuxbo5iD1dSbLlJGXGpfTDqbggqjHJeyzx88I3rfwjS38WJag/ihH7lzuGlGHpDBymLirZQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/prism.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/components/prism-markdown.js"></script>
            <link href="${styleResetUri}" rel="stylesheet" />
            <link href="${styleVSCodeUri}" rel="stylesheet" />
            <link href="${codeInStyling}" rel="stylesheet" />
            <link href="${codeCompleteStyle}" rel="stylesheet" />
            <link href="${codeTourStyle}" rel="stylesheet" />

            <script src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js"></script>
            

            ${highlightStyle}
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-core.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js"></script>


        </head>

        <script src="${codeTourScript}"></script>

        
        <div id="container" style="height: 100%"></div>
        <body class="line-numbers" id="body" style="overflow: scroll" >
        
        <div id="page" class="page">
        <script src="${codeIn}"></script>
        <!--...-->
        <script src="${codeAutoDetect}"></script>
        <script src="${codeIndent}"></script>
        <script src="${codeComplete}"></script>
        <script src="${codeDeBounce}"></script>

        
        
        
        
        <!--...-->
        <script>
        codeInput.registerTemplate("code-input", 
            codeInput.templates.prism(
            Prism, 
            [
                
                
                new codeInput.plugins.Indent()
            ]
            )
        );
        </script>
        <div class="storage-tray">
            <button class="storage-tray-button" id="storage-tray-button" onclick="addCodeTour(this)">+</button>
            </br>
            </br>
            
            
        </div>
        <div id="pop-container" class="pop-up-container" style="left: 100px;">
        </div>

                

                <div id="delete-container" class="delete-container">
                   <b id="delete-prompt" class="delete-prompt" >Do you want to delete this step?</b>
                   </br>

                   <div class="code-steps-inner" id="stepToDelete">	
                        <span class="step-title"><b>Step 0</b></span> 
                    </div>

                   </br>
                   <div id="button-container" style="padding-top: 50%; display: flex; justify-content: center">
                   <button id="deleteBtn" class="delete-btn" onClick="deleteSteps()">Delete</button>
                   <button id="cancel-btn" class="cancel-btn" onclick="closeDeleteBox()">Cancel</button>
                   </div>
                </div>

                <div class="code-steps-box">
                        <div id="@@@Step0@@@" class="code-steps">
                        <div class="code-steps-inner">	
                        <span  class="step-title"><b>Step 0</b></span> 
                        </div>
                        <div id="file-path-div">
                            <label>Relative File Path*:</label>
                            <input id="file-path" class="file-path-box">
                            </input>
                        </div>
                        <div id="line-number-div">
                            <label>Line Number*:</label>
                            <input id="line-number" class="line-number-box">
                            </input>
                        </div>
                        <div id="description-div">
                            <label>Description/Code:</label>
                            <textarea id="description-input" class="description-box">
                            </textarea>
                        </div>





                        <button id="save-step-button" class="save-step" onclick="saveStep(this)">Save</button>
                        <button style="display: none;" id="edit-step-button" class="edit-step" onclick="editStep(this)">Edit</button>
                    </div>
                </div>

            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Monaco Editor</title>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs/loader.js"></script>
                <style>
                    html, body, #container {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        padding-left: 20px;
                        overflow: hidden;
                    },
                    .custom-button {
                        background-color: blue;
                        color: white;
                        border: 2px solid black;
                        border-radius: 5px;
                        padding: 5px 10px;
                    }
                </style>
               
            </head>
            
            <body>
            <div id="container"></div>
            <script>
            require.config({
                paths: {
                    'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.30.1/min/vs'
                }
            });
      
            require(['vs/editor/editor.main'], function() {
                const editor = monaco.editor.create(document.getElementById('container'), {
                    value: \`${parsedTextEscaped}\`,
                    language: 'markdown',
                    theme: '${vsTheme}',
                    scrollBeyondLastLine: false,
                });


            
                const parsedYaml = ${tourDataStr};
                let numbersArray = []

                if (parsedYaml !== "") {
                    parsedYaml.steps.forEach(step => {
                        const button = document.createElement('button');
                        button.classList.add('tour-button-style')
                        button.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
                        button.id = 'Step ' + step.step_number;
                        button.textContent = 'Step ' + step.step_number;
                        button.addEventListener('click', () => {
                            openDeleteBox(step.step_number);
                            });
                        const lineTop = editor.getTopForLineNumber(step.line_number);
                        button.style.top = lineTop + 'px';
                        editor.onDidScrollChange(() => {
                            const scrollInfo = editor.getScrollTop();
                            button.style.top = (lineTop - scrollInfo) + 'px';
                            });

                        numbersArray.push(step.line_number);
                        editor.getDomNode().appendChild(button);
                    })
                }

                

        
                function postUpdatedContent() {
                    const updatedContent = editor.getValue();
                    vscode.postMessage({
                        type: 'updateFile',
                        message: updatedContent
                    });
                }


                editor.onMouseDown(function(e) {
                    if (e.target.type === monaco.editor.MouseTargetType.CONTENT_WIDGET) {
                        return;
                    }
                
                    const cursorPosition = editor.getPosition();
                    const lineTop = editor.getTopForLineNumber(cursorPosition.lineNumber);
                    
                    vscode.postMessage({
                        type: 'cursorPosition',
                        message: cursorPosition
                    });

                    const scrollInfo = editor.getScrollTop();
                    document.getElementById('@@@Step0@@@').style.top = (lineTop - scrollInfo) + 'px';
                    
                    let element = document.getElementById('@@@Step${this.numOfSteps + 1}@@@');
                    
                    if (element !== null && element.style !== undefined) {
                        element.style.top = (lineTop - scrollInfo) + 'px';
                    }
                });

                editor.onMouseWheel(function(e) {
                    const cursorPosition = editor.getPosition();
                    const lineTop = editor.getTopForLineNumber(cursorPosition.lineNumber);
                    e.preventDefault();
                    const scrollInfo = editor.getScrollTop();
                    
                    let element = document.getElementById('@@@Step${this.numOfSteps + 1}@@@');
                
                    if (element !== null && element.style !== undefined) {
                        element.style.top = (lineTop - scrollInfo) + 'px';
                    }

                });


                let numOfSteps = ${this.numOfSteps};
        
                editor.onDidChangeModelContent(function(e) {
                    postUpdatedContent();
                });
        
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    if (message.type === 'deleteTourStep') {
                        const cursorPosition = editor.getPosition();
                        let lineNumber = cursorPosition.lineNumber
                        let index = numbersArray.indexOf(lineNumber);
                        if (index > -1) {
                            numbersArray.splice(index, 1);
                        }
                        numOfSteps--;
                    }
                    if (message.type === 'placeStep') {
                        const button = document.createElement('button');
                        const cursorPosition = editor.getPosition();
                        let lineNumber = cursorPosition.lineNumber

                        if (numbersArray.includes(lineNumber)) {
                            while (numbersArray.includes(lineNumber)) {
                                lineNumber++;
                            }
                        }

                        newStep = (numOfSteps + 1)
                        numbersArray.push(lineNumber);
                        
                        const lineTop = editor.getTopForLineNumber(lineNumber);
                        const scrollInfo = editor.getScrollTop();
                        button.style.top = (lineTop - scrollInfo) + 'px';
                        
                        button.id = 'Step ' + newStep;
                        button.classList.add('tour-button-style')
                        button.style.backgroundColor = message.message;
                        button.textContent = 'Step ' + newStep;
                        const deleteButton = newStep;
                        button.addEventListener('click', () => {
                            openDeleteBox(deleteButton);
                      });
                        editor.onDidScrollChange(() => {
                            const scrollInfo = editor.getScrollTop();
                            button.style.top = (lineTop - scrollInfo) + 'px';
                        });


                        editor.getDomNode().appendChild(button);

                        numOfSteps++;
                    }
                    
                });



            });
            </script>
        </body>

            <script  nonce="${nonce}" src="${styleJS}" ></script>
        </div>
        </body>
        </html>`;


    }

    // editor.executeEdits('', [{
    //     range: new monaco.Range(cursorPosition.lineNumber, cursorPosition.column, cursorPosition.lineNumber, cursorPosition.column),
    //     text: '@@@example@@@'
    // }]);


    /**
     * Try to get a current document as json text.
     */
    private getDocumentAsJson(document: vscode.TextDocument): any {
        const text = document.getText();
        if (text.trim().length === 0) {
            return {};
        }

        try {
            return JSON.parse(text);
        } catch {
            throw new Error('Could not get document as json. Content is not valid json');
        }
    }

    /**
     * Write out the json to a given document.
     */
    private updateTextDocument(document: vscode.TextDocument, json: any) {
        const edit = new vscode.WorkspaceEdit();

        // Just replace the entire document every time for this example extension.
        // A more complete extension should compute minimal edits instead.
        edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            JSON.stringify(json, null, 2));

        return vscode.workspace.applyEdit(edit);
    }
}


export function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
