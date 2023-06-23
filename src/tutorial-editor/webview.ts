import path = require('path');
import { stringify } from 'querystring';
import { cachedDataVersionTag } from 'v8';
import * as vscode from 'vscode';
import * as yaml from 'js-yaml';

export async function activateEditor(context: vscode.ExtensionContext) {
    console.log("WE FUCKIN HERE!");

    // Register our custom editor providers
    context.subscriptions.push(TutorialEditorProvider.register(context));

}


/**
 * Provider for cat scratch editors.
 * 
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 * 
 * This provider demonstrates:
 * 
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class TutorialEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        const provider = new TutorialEditorProvider(context);
        const options = { suppportsMultipleEditorsPerDocument: false, webviewOptions: { enableScripts: true, retainContextWhenHidden: true } };
        const providerRegistration = vscode.window.registerCustomEditorProvider(TutorialEditorProvider.viewType, provider, options);
        return providerRegistration;
    }

    public text: any;
    public addCodeTourBtn: any = `<button class="add-code-tour" onclick="addCodeTour()">Create Code Tour</button>`;
    private static readonly viewType = 'catCustoms.catScratch';

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
        console.log("WE FUCKIN HERE!");


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

        // const panel = vscode.window.createWebviewPanel(
        // 	'catCoding',
        // 	'Cat Coding',
        // 	vscode.ViewColumn.One,
        // 	{
        // 	  enableScripts: true,
        // 	  retainContextWhenHidden: true
        // 	}
        //   );

        // webviewPanel.options.retainContextWhenHidden = true;


        let fs = require('fs')

        var files = document.fileName.split("/");
        var fileName = files[files.length - 1];
        var fileNoExt = fileName.split(".")[0];
        this.fileNum = Number(fileNoExt.split("-")[1]);

        console.log(`DOC NAME: ${fileNoExt}`);
        this.tourFilePath = path.join(this.baseWorkspaceUri.fsPath, ".gigo", ".tours", `${fileNoExt}.tour`);

        if (fs.existsSync(this.tourFilePath)) {
            let tour = fs.readFileSync(this.tourFilePath, 'utf-8');
            let ts = JSON.parse(tour).steps;
            this.numOfSteps = ts.length;
            this.fullTour = JSON.parse(tour);
            console.log("REGISTERED EXITS")
        } else {
            console.log("NOT REGISTERED EXITS")
            var obj = {
                $schema: "https://aka.ms/codetour-schema",
                title: fileNoExt,
                steps: [],
                ref: "master",
            };

            this.fullTour = JSON.stringify(obj);

            fs.writeFileSync(this.tourFilePath, this.fullTour, 'utf-8');
        }

        console.log(`text from load: ${document.getText()}`);
        this.text = document.getText();
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

        // webviewPanel.onDidChangeViewState(() => {
        // 	console.log(`code tours: ${this.codeTourSteps}`)
        // 	webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
        // })


        // Make sure we get rid of the listener when our editor is closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });




        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'syntaxHighlight':
                    var Prism = require('prismjs');
                    Prism.highlightElement(e.message);
                    return;
                case 'hello':
                    vscode.window.showInformationMessage(e.message);
                    break;
                case 'updateFile':
                    this.updateCounter++;
                    this.text = e.message;
                    vscode.window.showInformationMessage(`${e.message.length}`);
                    try {
                        fs.writeFileSync(document.fileName, this.text, 'utf-8');
                    } catch (err) {
                        vscode.window.showInformationMessage(`error in file write ${err}`);
                    }

                    // if (this.updateCounter >= 30){
                    // 	webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
                    // 	this.updateCounter = 0;
                    // }

                    return;
                case "openCodeTourDialog":
                    vscode.window.showInformationMessage('openCodeTourDialog');
                    return;
                case 'addCodeTour':
                    vscode.window.showInformationMessage('add code tour');
                // webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
                case "cursorPosition":
                    if (e.message !== undefined) {
                        this.cursorPos = e.message["lineNumber"];
                    }
                    console.log("this worked!!! ", this.cursorPos);
                    return;
                case "tourStepButton":
                    console.log("button", + e.message, "was clicked");
                return;

                case 'saveTourStep':
                    webviewPanel.webview.postMessage({ type: 'placeStep' });
                    console.log("this worked!!!", this.cursorPos);
                    

                    const filePath = path.join(this.baseWorkspaceUri.fsPath, "tour-2.yaml");
                    const fileContents = fs.readFileSync(filePath, 'utf8');
                    const tourData = yaml.load(fileContents) as any;
                    console.log("this is tourdata", tourData);
                    console.log("this is tourdata", this.cursorPos);
                    
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
 




                    // // vscode.window.showInformationMessage(`saveTourStep tour num: ${this.numOfSteps}`);
                    // console.log(`${e.message}`)
                    // console.log(`saveTourStep tour num: ${this.numOfSteps}`)

                    // let tour = fs.readFileSync(this.tourFilePath, 'utf-8');
                    // let ts = JSON.parse(tour);


                    // let parsedMsg = JSON.parse(e.message);

                    // parsedMsg.line = parseInt(parsedMsg.line);
                    // var stepNum = parseInt(parsedMsg.step);
                    // delete parsedMsg['step'];




                    // console.log('before all checking steps')
                    // if (parsedMsg.line < 1) {
                    //     console.log('incorrect value passed for parsedMsg.line: ', parsedMsg.line);
                    //     vscode.window.showInformationMessage(`Incorrect line number for step. Please ensure that the line number is greater than 0.`);
                    //     return;
                    // }

                    // console.log("before do exist check")
                    // var doExist = false;

                    // try {
                    //     doExist = fs.existsSync(path.join(this.baseWorkspaceUri.fsPath, parsedMsg.file));

                    // } catch (e) {
                    //     console.log(e);
                    // }


                    // console.log("after do exist")

                    // if (!doExist) {
                    //     console.log("does exist: ", doExist, " file path: ", path.join(this.baseWorkspaceUri.fsPath, parsedMsg.file));
                    //     vscode.window.showInformationMessage(`Incorrect file path for step. Please ensure that the file exists and is the relative path to the file.`);
                    //     return;
                    // }

                    // console.log("after file check")

                    // const readline = require('readline');

                    // var fileP = path.join(this.baseWorkspaceUri.fsPath, parsedMsg.file);
                    // var linesCount = 0;
                    // var rl = readline.createInterface({
                    //     input: fs.createReadStream(fileP),
                    //     output: process.stdout,
                    //     terminal: false
                    // });
                    // rl.on('line', function (line: any) {
                    //     linesCount++; // on each linebreak, add +1 to 'linesCount'
                    // });
                    // rl.on('close', function () {
                    //     console.log(linesCount); // print the result when the 'close' event is called
                    // });


                    // console.log(`than number of lines in file ${linesCount}`);


                    // if (parsedMsg > linesCount) {
                    //     console.log(`number of lines in pass ${parsedMsg.line} is greater than number of lines in file ${linesCount}`);
                    //     vscode.window.showInformationMessage(`Incorrect line number for step. Please ensure that the line number exists in file.`);
                    //     return;
                    // }


                    // console.log("after line num check")


                    // if (stepNum > this.numOfSteps) {
                    //     this.numOfSteps++;
                    //     ts.steps.push(parsedMsg);
                    // } else {
                    //     ts.steps[stepNum - 1] = parsedMsg;
                    //     console.log(`ts: ${JSON.stringify(ts)}`);
                    // }










                    // this.fullTour = JSON.stringify(ts);
                    // fs.writeFileSync(this.tourFilePath, this.fullTour, 'utf-8');


                    // vscode.window.showInformationMessage(`save code tour, fp: ${e.message.file}, ln: ${e.message.line} desc: ${e.message.description}`);
                    break;
                // let tourName = document.fileName.replace('cscratch', 'tour');
                // fs.writeFileSync(path.join(this.baseWorkspaceUri.fsPath, ".tours", `${tourName}`), );

                case 'deleteTourStep':
                    webviewPanel.webview.postMessage({ type: 'deleteTourStep' });

                    vscode.window.showInformationMessage("step to be deleted: ", e.message);
                    // var deletedStepNum = parseInt(e.message);
                    // // vscode.window.showInformationMessage(`delete step: ${deletedStepNum} `);
                    // let tours = fs.readFileSync(this.tourFilePath, 'utf-8');
                    // let tss = JSON.parse(tours);
                    // this.numOfSteps--;


                    // tss.steps = tss.steps.splice(deletedStepNum);
                    // // vscode.window.showInformationMessage(`new steps: ${JSON.stringify(tss.steps.splice(deletedStepNum))} `);
                    // this.fullTour = JSON.stringify(tss);
                    // fs.writeFileSync(this.tourFilePath, this.fullTour, 'utf-8');
                    const delFilePath = path.join(this.baseWorkspaceUri.fsPath, "tour-2.yaml");
                    const deliFleContents = fs.readFileSync(delFilePath, 'utf8');
                    const delTourData = yaml.load(deliFleContents) as any;

                    const delStep = delTourData.steps.filter((step: any) => step.step_number === e.message);
                    console.log("deleting step: ", e.message);

                    // The step to delete (replace with actual user input)
                    const stepToDelete = e.message;

                    // Remove the desired step from the array and adjust line numbers for following steps
                    delTourData.steps.splice(stepToDelete-1, 1);
                    for (let i = stepToDelete-1; i < delTourData.steps.length; i++) {
                        delTourData.steps[i].step_number -= 1;
                    }

                    // Convert the updated JavaScript object back into YAML
                    const updatedYaml = yaml.dump(delTourData);


                    fs.writeFileSync(delFilePath, updatedYaml);

                    this.numOfSteps = this.numOfSteps - 1;

                    break;
            }
        });

        updateWebview();
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


        console.log("WE FUCKIN HERE!");
        console.log(this.context.extensionUri);
        // Local path to script and css for the webview
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'dist', 'tutorial-editor', 'catScratch.js'));

        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'dist', 'tutorial-editor', 'reset.css'));

        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'dist', 'tutorial-editor', 'vscode.css'));

        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
            this.context.extensionUri, 'dist', 'tutorial-editor', 'catScratch.css'));
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

        var parsedText = this.text.replace(/["]/g, `'`);

        const parsedTextEscaped = parsedText.replace(/`/g, '\\`');

        let vsTheme = 'vs';
        if (vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark) {
            vsTheme = 'vs-dark';
        } 

        // const filePath = path.join(this.baseWorkspaceUri.fsPath, "tour-" + this.fileNum + ".yaml");
        let filePath = path.join(this.baseWorkspaceUri.fsPath, "tour-2.yaml");
        let fileContents = fs.readFileSync(filePath, 'utf8');
        let tourData = yaml.load(fileContents) as any;
        let tourDataStr = JSON.stringify("");
        if (tourData !== undefined) {
            tourDataStr = JSON.stringify(tourData);
            this.numOfSteps = tourData.steps.length;
        } else if (tourData === undefined) {
            this.numOfSteps = 0;
        }
        


        console.log(`text before render: ${this.text.length}`);
        console.log(`steps befor load: ${JSON.stringify(this.fullTour.steps)}`);
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
            <link href="${styleMainUri}" rel="stylesheet" />
            <link href="${codeInStyling}" rel="stylesheet" />
            <link href="${codeCompleteStyle}" rel="stylesheet" />
            <link href="${codeTourStyle}" rel="stylesheet" />

            <script src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js"></script>
            

            ${highlightStyle}
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/components/prism-core.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/line-numbers/prism-line-numbers.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js"></script>


            <title>Cat Scratch</title>
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
                        <span  class="step-title"><b>Step 0</b></span> 
                    </div>

                   </br>
                   <div id="button-container" style="padding-top: 50%; display: flex; justify-content: center">
                   <button id="deleteBtn" class="delete-btn" onClick="deleteSteps()">Delete</button>
                   <button id="cancel-btn" class="cancel-btn" onclick="closeDeleteBox()">Cancel</button>
                   </div>
                </div>

                <div class="code-steps-box">
                        <div id="@@@Step0@@@" draggable="true" ondragstart="dragElement(this)" oncontextmenu="expandStep(event, this)" class="code-steps">
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

                console.log("this is the full array", numbersArray);
                

        
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
                    
                    console.log("this is myline", lineTop);
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
                console.log("numOfSteps", numOfSteps);
        
                editor.onDidChangeModelContent(function(e) {
                    postUpdatedContent();
                });
        
                window.addEventListener('message', event => {
                    const message = event.data;
                    if (message.type === 'deleteTourStep') {
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
                        button.style.backgroundColor = '#' + Math.floor(Math.random()*16777215).toString(16);
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
            <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
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
