import path = require('path');
import * as vscode from 'vscode';
import { getNonce } from './util';

export async function activateEditor(context: vscode.ExtensionContext) {
	console.log("WE FUCKIN HERE!");
	
	// Register our custom editor providers
	context.subscriptions.push(CatScratchEditorProvider.register(context));
	
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
export class CatScratchEditorProvider implements vscode.CustomTextEditorProvider {

	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new CatScratchEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(CatScratchEditorProvider.viewType, provider);
		return providerRegistration;
	}

	public text: any;
	public addCodeTourBtn: any = `<button class="add-code-tour" onclick="addCodeTour()">Create Code Tour</button>`;

	private static readonly viewType = 'catCustoms.catScratch';

	private static readonly scratchCharacters = ['😸', '😹', '😺', '😻', '😼', '😽', '😾', '🙀', '😿', '🐱'];
	public baseWorkspaceUri!: vscode.Uri;
	public codeTourSteps: string[] = [];
	public numOfSteps: number = 0;
	public moveSVG: any;
	public trashOpen = `<svg disabled="true" class="trash-icon-open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
	<path class="trash-icon-path" d="M9 13v6c0 .552-.448 1-1 1s-1-.448-1-1v-6c0-.552.448-1 1-1s1 .448 1 1zm7-1c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm-4 0c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm4.333-8.623c-.882-.184-1.373-1.409-1.189-2.291l-5.203-1.086c-.184.883-1.123 1.81-2.004 1.625l-5.528-1.099-.409 1.958 19.591 4.099.409-1.958-5.667-1.248zm4.667 4.623v16h-18v-16h18zm-2 14v-12h-14v12h14z"/>
	</svg>`;

	constructor(
		private readonly context: vscode.ExtensionContext
	) { this.text = ""; }

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
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		let fs = require('fs')

		this.moveSVG =  webviewPanel.webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'move_icon_2.svg'));
		vscode.window.onDidChangeActiveColorTheme(() =>{
			webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
			
			
		});

		

		console.log("WE FUCKIN HERE!");
		this.text = document.getText();
		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				text: document.getText(),
			});
		}

		

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
					return
				case "openCodeTourDialog":
					vscode.window.showInformationMessage('openCodeTourDialog');
					return;
				case 'addCodeTour':
					this.numOfSteps ++;

					this.codeTourSteps.push(`
					<div id="@@@Step${this.numOfSteps}@@@" draggable="true" ondragstart="dragElement(this)" ondblclick="expandStep(this)" class="code-steps">
							<img id="@@@Step${this.numOfSteps}@@@" class="move-icon" draggable="true" ondragstart="drag(event)" src = "${this.moveSVG}" alt="My Happy SVG">
						

							</img>

							<div class="code-steps-inner">	
							<span id="@@@Step${this.numOfSteps}@@@" class="step-title" draggable="true" ondragstart="drag(event)"><b>Step ${this.numOfSteps}</b></span> 
							</div>
							
							<div id="file-path-div">
								<label>File Path:</label>
								<input id="file-path" class="file-path-box">
								</input>
							</div>
							<div id="line-number-div">
								<label>Line Number:</label>
								<input id="line-number" class="line-number-box">
								</input>
							</div>
                            

							


							<button id="save-step-button" class="save-step" onclick="saveStep(this)">Save</button>
							<button style="display: none;" id="edit-step-button" class="edit-step" onclick="editStep(this)">Edit</button>
						</div>
					`);

					vscode.window.showInformationMessage('add code tour');
					// webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
					

					return;
				case 'saveTourStep':
					console.log(`${e.message}`)
					vscode.window.showInformationMessage(`save code tour, fp: ${e.message}, ln: ${e.message.lineNumber}`);
					break;
					// let tourName = document.fileName.replace('cscratch', 'tour');
					// fs.writeFileSync(path.join(this.baseWorkspaceUri.fsPath, ".tours", `${tourName}`), );

			}
		});

		updateWebview();
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {


		let highlightStyle = `<link id="import-theme" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism-dark.css"/>`;

		if (vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light){
			highlightStyle = `<link id="import-theme" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/themes/prism.css"/>`;
		}


		console.log("WE FUCKIN HERE!");
		console.log(this.context.extensionUri);
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'catScratch.js'));

		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'src','tutorial-editor', 'media', 'reset.css'));

		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'src','tutorial-editor', 'media', 'vscode.css'));

		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'catScratch.css'));
		const styleJS = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'style.js'));

		const codeIn = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'code-input.js'));
		const codeAutoDetect = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'autodetect.min.js'));
		const codeIndent= webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'indent.js'));
		const codeComplete= webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'autocomplete.js'));
		const codeCompleteStyle= webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'autocomplete.css'));
		const codeInStyling = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'code-input.css'));
		const codeDeBounce = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'debounce-update.js'));

		const codeTourScript = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'code-tour.js'));
		const codeTourStyle = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'code-tour.css'));


		const coordsUtil = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'textareaCoords.js'));

		this.moveSVG = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'move_icon_2.svg'));
		const trashPng = webview.asWebviewUri(vscode.Uri.joinPath(this.context.extensionUri, 'src', 'tutorial-editor', 'media', 'trash.png'));

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

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

				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/styles/github-dark.min.css" integrity="sha512-rO+olRTkcf304DQBxSWxln8JXCzTHlKnIdnMUwYvQa9/Jd4cQaNkItIUj6Z4nvW1dqK0SKXLbn9h4KwZTNtAyw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/themes/default.css" integrity="sha512-HPYcuSKzZ/FwxsRKIiNX6imjfnr5+82poiPO+oXi9WCEEe2q1x2OOBpbF+6cRG+hwoEsBXfs7oQveu5yHbY64g==" crossorigin="anonymous" referrerpolicy="no-referrer" />
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.23.0/plugins/autoloader/prism-autoloader.min.js"></script>


				<title>Cat Scratch</title>
			</head>
			<body>
			<div id="container" style="height: 100%"></div>
			<body>
			
			<script src="${codeIn}"></script>
			<!--...-->
			<script src="${codeAutoDetect}"></script>
			<script src="${codeIndent}"></script>
			<script src="${codeComplete}"></script>
			<script src="${codeDeBounce}"></script>

			<script src="${codeTourScript}"></script>

			
			
			
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
				<button class="storage-tray-button" id="storage-tray-button" onclick="addCodeTour()">+</button>
				</br>
				</br>
				<button class="trash">
					<svg class="trash-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
						<path class="trash-icon-path" d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/>
					</svg>

					
				</button>
				
			</div>
			<div id="pop-container" class="pop-up-container">
				<div id="add-pop" class="add-pop-up"></div>
				<div class="arrow-left"></div>
			</div>
			
				${this.addCodeTourBtn}

				</br>
				</br>
				
					<div class="code-steps-box">
							<div id="@@@Step${this.numOfSteps}@@@" draggable="true" ondragstart="dragElement(this)" ondblclick="expandStep(this)" class="code-steps">
							<img  class="move-icon" draggable="true" ondragstart="drag(event)" src = "${this.moveSVG}" alt="My Happy SVG">
						

							</img>

							<div class="code-steps-inner">	
							<span  class="step-title" draggable="true" ondragstart="drag(event)"><b>Step ${this.numOfSteps}</b></span> 
							</div>
							
							<div id="file-path-div">
								<label>File Path:</label>
								<input id="file-path" class="file-path-box">
								</input>
							</div>
							<div id="line-number-div">
								<label>Line Number:</label>
								<input id="line-number" class="line-number-box">
								</input>
							</div>
							

							


							<button id="save-step-button" class="save-step" onclick="saveStep(this)">Save</button>
							<button style="display: none;" id="edit-step-button" class="edit-step" onclick="editStep(this)">Edit</button>
						</div>
					</div>

						

						

					</br>
					</br>
			
					<code-input id="ci-external" lang="Markdown" style="letter-spacing: inherit;" value="${this.text}"></code-input>		
			

				<script  nonce="${nonce}" src="${styleJS}" ></script>
				<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
				
			</body>
			</html>`;
	}

	/**
	 * Add a new scratch to the current document.
	 */
	private addNewScratch(document: vscode.TextDocument) {
		const json = this.getDocumentAsJson(document);
		const character = CatScratchEditorProvider.scratchCharacters[Math.floor(Math.random() * CatScratchEditorProvider.scratchCharacters.length)];
		vscode.window.showInformationMessage(`${character}`);
		json.scratches = [
			...(Array.isArray(json.scratches) ? json.scratches : []),
			{
				id: getNonce(),
				text: character,
				created: Date.now(),
			}
		];

		return this.updateTextDocument(document, json);
	}

	/**
	 * Delete an existing scratch from a document.
	 */
	private deleteScratch(document: vscode.TextDocument, id: string) {
		const json = this.getDocumentAsJson(document);
		if (!Array.isArray(json.scratches)) {
			return;
		}

		json.scratches = json.scratches.filter((note: any) => note.id !== id);

		return this.updateTextDocument(document, json);
	}

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
