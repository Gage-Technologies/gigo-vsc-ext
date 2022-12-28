import * as vscode from 'vscode';
import { executeAfkCheck, executeLiveCheck } from '../session/sessionUpdate';

export function activateAfkWebView(context: vscode.ExtensionContext) {
    const provider = new AFKWebViewprovider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(AFKWebViewprovider.viewType, provider));

	context.subscriptions.push(
		vscode.commands.registerCommand('gigo.enableAFK', () => {
			provider.enableAFK();
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('gigo.disableAFK', () => {
			provider.disableAFK();
		}));
}

class AFKWebViewprovider implements vscode.WebviewViewProvider {

    public static readonly viewType = 'gigo.afkView';

    private _view?: vscode.WebviewView;
    public afkActive?: boolean = false;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { 
        // load configuration value for afk from
        let gigoConfig = vscode.workspace.getConfiguration("gigo");
        this.afkActive = gigoConfig.get("afk.on");

        //this.disableAFK();
    }


	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'enableAFK':
                    this.enableAFK();
                    break;
                case 'disableAFK':
                    this.disableAFK();
                    break;
                case "hello":
                    vscode.window.showInformationMessage(data.text);
                    return;
			}
		});
	}

	public addColor() {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ type: 'addColor' });
		}
	}

	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
		}
	}

    public enableAFK() {
		let afkActiveStart = this.afkActive;
        this.afkActive = true;
        let gigoConfig = vscode.workspace.getConfiguration("gigo");
        gigoConfig.update("afk.on", true);

		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.html = this._getHtmlForWebview(this._view.webview);
		}

		if (!afkActiveStart) {
			executeAfkCheck(
				"7311fb2a-f09b-4575-9ca2-254f7cbfeda6", 
				"cd68f3ed9b605731d2cae49a41eeaf405e4a9d37b74c2a1e8f1ad08cc58a17ee", 
				"60"
			).then((exp) => {
				if (this._view) {
					this._view.webview.postMessage({ type: "setExpirationAFK", value: exp });
				}
			});

			vscode.window.showInformationMessage("GIGO AFK Session Activated");
		}
	}

	public disableAFK() {
		console.log("is active in webview: " + this.afkActive);
		let afkActiveStart = this.afkActive;
		this.afkActive = false;
		let gigoConfig = vscode.workspace.getConfiguration("gigo");
		gigoConfig.update("afk.on", false);
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.html = this._getHtmlForWebview(this._view.webview);
		}

		if (afkActiveStart){
			// TODO: execute live check to disabled afk
			executeLiveCheck("7311fb2a-f09b-4575-9ca2-254f7cbfeda6", "cd68f3ed9b605731d2cae49a41eeaf405e4a9d37b74c2a1e8f1ad08cc58a17ee");

			vscode.window.showInformationMessage("GIGO AFK Session Deactivated");
		}
       
	}

	private _getHtmlForWebview(webview: vscode.Webview) {
        if (this.afkActive) {
            return this._getAfkEnabledHtml(webview);
        }
        return this._getAfkDisabledHtml(webview);
	}

    private _getAfkDisabledHtml(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'afk', 'media', 'disabled.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'afk', 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'afk', 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'afk', 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
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
			<body>
				<text>
                Enable AFK to preserve your workspace for up to an hour without activity.
				</text>
                <br/>
                <br/>
				<button class="enable-gigo-afk-button">Enable AFK</button>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }

    private _getAfkEnabledHtml(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'afk', 'media', 'enabled.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'afk', 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'afk', 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'afk', 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
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
			<body>
				<text>
                AFK is currently enabled. You session will be preserved for up to an hour without activity. View the remaining time on your AFK session below.
				</text>
                <br/>
                <br/>
                  <h4 class="expiration-countdown-title">
                    AFK Expires In: 
                  </h4>
                  <div id="expiration-countdown-value" class="expiration-countdown-value">
                    Loading...
                  </div>
                <br/>
                <br/>
				<button class="disable-gigo-afk-button">Disable AFK</button>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }
}



function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}