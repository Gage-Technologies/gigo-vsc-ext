"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatScratchEditorProvider = exports.activateEditor = void 0;
const path = require("path");
const vscode = require("vscode");
const util_1 = require("./util");
async function activateEditor(context) {
    console.log("WE FUCKIN HERE!");
    // Register our custom editor providers
    context.subscriptions.push(CatScratchEditorProvider.register(context));
}
exports.activateEditor = activateEditor;
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
class CatScratchEditorProvider {
    constructor(context) {
        this.context = context;
        this.addCodeTourBtn = `<button class="add-code-tour" onclick="addCodeTour()">Create Code Tour</button>`;
        this.codeTourSteps = [];
        this.numOfSteps = 0;
        this.trashOpen = `<svg disabled="true" class="trash-icon-open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<path class="trash-icon-path" d="M9 13v6c0 .552-.448 1-1 1s-1-.448-1-1v-6c0-.552.448-1 1-1s1 .448 1 1zm7-1c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm-4 0c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm4.333-8.623c-.882-.184-1.373-1.409-1.189-2.291l-5.203-1.086c-.184.883-1.123 1.81-2.004 1.625l-5.528-1.099-.409 1.958 19.591 4.099.409-1.958-5.667-1.248zm4.667 4.623v16h-18v-16h18zm-2 14v-12h-14v12h14z"/>
	</svg>`;
        this.tourFilePath = "";
        this.text = "";
    }
    static register(context) {
        const provider = new CatScratchEditorProvider(context);
        const providerRegistration = vscode.window.registerCustomEditorProvider(CatScratchEditorProvider.viewType, provider);
        return providerRegistration;
    }
    /**
     * Called when our custom editor is opened.
     *
     *
     */
    async resolveCustomTextEditor(document, webviewPanel, _token) {
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
            enableScripts: true,
        };
        let fs = require('fs');
        var files = document.fileName.split("/");
        var fileName = files[files.length - 1];
        var fileNoExt = fileName.split(".")[0];
        console.log(`DOC NAME: ${fileNoExt}`);
        this.tourFilePath = path.join(this.baseWorkspaceUri.fsPath, ".tours", `${fileNoExt}.tour`);
        if (fs.existsSync(this.tourFilePath)) {
            let tour = fs.readFileSync(this.tourFilePath, 'utf-8');
            let ts = JSON.parse(tour).steps;
            this.numOfSteps = ts.length;
            this.fullTour = JSON.parse(tour);
            console.log("REGISTERED EXITS");
        }
        else {
            console.log("NOT REGISTERED EXITS");
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
        this.moveSVG = webviewPanel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'move_icon_2.svg'));
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
        webviewPanel.onDidChangeViewState(() => {
            console.log(`code tours: ${this.codeTourSteps}`);
            webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
        });
        // Make sure we get rid of the listener when our editor is closed.
        webviewPanel.onDidDispose(() => {
            changeDocumentSubscription.dispose();
        });
        // Receive message from the webview.
        webviewPanel.webview.onDidReceiveMessage(e => {
            switch (e.type) {
                case 'add':
                    this.addNewScratch(document);
                    return;
                case 'delete':
                    this.deleteScratch(document, e.id);
                    return;
                case 'syntaxHighlight':
                    var Prism = require('prismjs');
                    Prism.highlightElement(e.message);
                    return;
                case 'hello':
                    vscode.window.showInformationMessage(e.message);
                    break;
                case 'updateFile':
                    this.text = e.message;
                    vscode.window.showInformationMessage(e.message);
                    try {
                        fs.writeFileSync(document.fileName, this.text, 'utf-8');
                    }
                    catch (err) {
                        vscode.window.showInformationMessage(`error in file write ${err}`);
                    }
                    return;
                case "openCodeTourDialog":
                    vscode.window.showInformationMessage('openCodeTourDialog');
                    return;
                case 'addCodeTour':
                    vscode.window.showInformationMessage('add code tour');
                    // webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
                    return;
                case 'saveTourStep':
                    // vscode.window.showInformationMessage(`saveTourStep tour num: ${this.numOfSteps}`);
                    console.log(`${e.message}`);
                    console.log(`saveTourStep tour num: ${this.numOfSteps}`);
                    let tour = fs.readFileSync(this.tourFilePath, 'utf-8');
                    let ts = JSON.parse(tour);
                    let parsedMsg = JSON.parse(e.message);
                    parsedMsg.line = parseInt(parsedMsg.line);
                    var stepNum = parseInt(parsedMsg.step);
                    delete parsedMsg['step'];
                    if (stepNum > this.numOfSteps) {
                        this.numOfSteps++;
                        ts.steps.push(parsedMsg);
                    }
                    else {
                        ts.steps[stepNum - 1] = parsedMsg;
                        console.log(`ts: ${JSON.stringify(ts)}`);
                    }
                    this.fullTour = JSON.stringify(ts);
                    fs.writeFileSync(this.tourFilePath, this.fullTour, 'utf-8');
                    vscode.window.showInformationMessage(`save code tour, fp: ${e.message.file}, ln: ${e.message.line} desc: ${e.message.description}`);
                    break;
                // let tourName = document.fileName.replace('cscratch', 'tour');
                // fs.writeFileSync(path.join(this.baseWorkspaceUri.fsPath, ".tours", `${tourName}`), );
                case 'deleteTourStep':
                    var deletedStepNum = parseInt(e.message);
                    vscode.window.showInformationMessage(`delete step: ${deletedStepNum} `);
                    let tours = fs.readFileSync(this.tourFilePath, 'utf-8');
                    let tss = JSON.parse(tours);
                    this.numOfSteps--;
                    tss.steps = tss.steps.splice(deletedStepNum);
                    vscode.window.showInformationMessage(`new steps: ${JSON.stringify(tss.steps.splice(deletedStepNum))} `);
                    this.fullTour = JSON.stringify(tss);
                    fs.writeFileSync(this.tourFilePath, this.fullTour, 'utf-8');
                    break;
            }
        });
        updateWebview();
    }
    /**
     * Get the static html used for the editor webviews.
     */
    getHtmlForWebview(webview) {
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
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'catScratch.js'));
        const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'reset.css'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'vscode.css'));
        const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'catScratch.css'));
        const styleJS = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'style.js'));
        const codeIn = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'code-input.js'));
        const codeAutoDetect = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'autodetect.min.js'));
        const codeIndent = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'indent.js'));
        const codeComplete = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'autocomplete.js'));
        const codeCompleteStyle = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'autocomplete.css'));
        const codeInStyling = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'code-input.css'));
        const codeDeBounce = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'debounce-update.js'));
        const codeTourScript = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'code-tour.js'));
        const codeTourStyle = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'code-tour.css'));
        const coordsUtil = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'textareaCoords.js'));
        this.moveSVG = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'move_icon_2.svg'));
        const trashPng = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'trash.png'));
        // Use a nonce to whitelist which scripts can be run
        const nonce = (0, util_1.getNonce)();
        console.log(`text before render: ${this.text}`);
        console.log(`steps befor load: ${JSON.stringify(this.fullTour.steps)}`);
        return /* html */ `
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
				<button id="trash" class="trash">
					<svg id="trash-icon" class="trash-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path class="trash-icon-path" d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/>
					</svg>

					
				</button>
				
			</div>
			<div id="pop-container" class="pop-up-container">
				<div id="add-pop" class="add-pop-up"></div>
				<div id="pop-arrow" class="arrow-left"></div>
			</div>
			

					<div id="delete-container" class="delete-container">
					   <b id="delete-prompt" class="delete-prompt" >Are you sure you want to delete?</b>
					   </br>
					   <div id="button-container" style="padding-top: 50%; display: flex; justify-content: center">
					   <button id="delete-btn" class="delete-btn">Delete</button>
					   <button id="cancel-btn" class="cancel-btn" onclick="closeDeleteBox()">Cancel</button>
					   </div>
					</div>
				
					<div class="code-steps-box">
							<div id="@@@Step0@@@" draggable="true" ondragstart="dragElement(this)" ondblclick="expandStep(this)" class="code-steps">
							<img  class="move-icon" draggable="true" ondragstart="drag(event)" src = "${this.moveSVG}" alt="My Happy SVG">
						

							</img>

							<div class="code-steps-inner">	
							<span  class="step-title" draggable="true" ondragstart="drag(event)"><b>Step 0</b></span> 
							</div>
							<div id="file-path-div">
								<label>File Path*:</label>
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

				
					<div class="input-container">
						<code-input id="ci-external" lang="Markdown" style="letter-spacing: inherit;" value="${this.text}"></code-input>
					</div>
			

				<script  nonce="${nonce}" src="${styleJS}" ></script>
				<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
			</div>
			</body>
			</html>`;
    }
    /**
     * Add a new scratch to the current document.
     */
    addNewScratch(document) {
        const json = this.getDocumentAsJson(document);
        const character = CatScratchEditorProvider.scratchCharacters[Math.floor(Math.random() * CatScratchEditorProvider.scratchCharacters.length)];
        vscode.window.showInformationMessage(`${character}`);
        json.scratches = [
            ...(Array.isArray(json.scratches) ? json.scratches : []),
            {
                id: (0, util_1.getNonce)(),
                text: character,
                created: Date.now(),
            }
        ];
        return this.updateTextDocument(document, json);
    }
    /**
     * Delete an existing scratch from a document.
     */
    deleteScratch(document, id) {
        const json = this.getDocumentAsJson(document);
        if (!Array.isArray(json.scratches)) {
            return;
        }
        json.scratches = json.scratches.filter((note) => note.id !== id);
        return this.updateTextDocument(document, json);
    }
    /**
     * Try to get a current document as json text.
     */
    getDocumentAsJson(document) {
        const text = document.getText();
        if (text.trim().length === 0) {
            return {};
        }
        try {
            return JSON.parse(text);
        }
        catch {
            throw new Error('Could not get document as json. Content is not valid json');
        }
    }
    /**
     * Write out the json to a given document.
     */
    updateTextDocument(document, json) {
        const edit = new vscode.WorkspaceEdit();
        // Just replace the entire document every time for this example extension.
        // A more complete extension should compute minimal edits instead.
        edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), JSON.stringify(json, null, 2));
        return vscode.workspace.applyEdit(edit);
    }
}
exports.CatScratchEditorProvider = CatScratchEditorProvider;
CatScratchEditorProvider.viewType = 'catCustoms.catScratch';
CatScratchEditorProvider.scratchCharacters = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '🙀', '😿', '🐱'];
//# sourceMappingURL=webview.js.map