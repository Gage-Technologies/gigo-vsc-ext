"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatScratchEditorProvider = exports.activateEditor = void 0;
const vscode = require("vscode");
const util_1 = require("./util");
async function activateEditor(context) {
    console.log("WE FUCKIN HERE!");
    vscode.window.showInformationMessage(`WE FUCKIN HERE`);
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
        // Setup initial content for the webview
        webviewPanel.webview.options = {
            enableScripts: true,
        };
        webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);
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
                    vscode.window.showInformationMessage(`${e.message}`);
            }
        });
        updateWebview();
    }
    /**
     * Get the static html used for the editor webviews.
     */
    getHtmlForWebview(webview) {
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
        // Use a nonce to whitelist which scripts can be run
        const nonce = (0, util_1.getNonce)();
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

				<script src="https://cdn.jsdelivr.net/gh/google/code-prettify@master/loader/run_prettify.js"></script>
				


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
			
			
			<!--...-->
			<script>
			codeInput.registerTemplate("syntax-highlighted", 
				codeInput.templates.hljs(
				hljs, 
				[
					
					
					new codeInput.plugins.Indent()
				]
				)
			);
			</script>

		
				<code-input lang="Markdown" style="letter-spacing: inherit;"></code-input>				

				<script  nonce="${nonce}" src="${styleJS}" ></script>
				<script type="module" nonce="${nonce}" src="${scriptUri}"></script>
				
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