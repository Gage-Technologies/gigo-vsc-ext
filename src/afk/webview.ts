import * as vscode from 'vscode';
import { executeAfkCheck, executeLiveCheck } from '../session/sessionUpdate';



//activateAfkWebview is called upon extension start and registers necessary commands for afk functionality
export function activateAfkWebView(context: vscode.ExtensionContext, cfg: any, logger: any) {
	//register afk provider by calling class constructor
    const provider = new AFKWebViewprovider(context.extensionUri, cfg, logger);
	//push and regsitser necessary commands
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

//afk webview provider has basic functions for handling afk system
class AFKWebViewprovider implements vscode.WebviewViewProvider {

    public static readonly viewType = 'gigo.afkView';

    private _view?: vscode.WebviewView;
    public afkActive?: boolean = false;
	public cfg: any;
	public logger: any;

	constructor(
		private readonly _extensionUri: vscode.Uri,
		cfg: any,
		sysLogger: any
	) { 
		this.cfg = cfg;
		this.logger = sysLogger;
    
        // load configuration value for afk from
        let gigoConfig = vscode.workspace.getConfiguration("gigo");


        //this.disableAFK();
    }


	//resolveWebviewView handles editor callback functions and basic html render
	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;
		this._view.webview.postMessage({type: "hello", text: `currentAfkValue: ${this.afkActive}`});
		this._view.webview.html = this._getAfkDisabledHtml(this._view.webview);


		//setup webview
		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};


		//render html from getHtmlForWebview function
		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		//callback for registered commands
		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'enableAFK':
					//call enable afk function when enableAFK command is called
                    this.enableAFK();
                    break;
                case 'disableAFK':
					//call disable afk function when disableAFK command is called
                    this.disableAFK();
                    break;
                case "hello":                    
                    return;
			}
		});
	}

	//addColor sends color message to messsage handler
	public addColor() {
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.postMessage({ type: 'addColor' });
		}
	}

	//clearColors sends color message to clear colors to message handler
	public clearColors() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'clearColors' });
		}
	}

	//enableAFK calls executeAfkCheck and rerenders the page accordingly
    public enableAFK() {
		//setup afk variables
		let afkActiveStart = this.afkActive;
        this.afkActive = true;

		//retrieve gigo config
        let gigoConfig = vscode.workspace.getConfiguration("gigo");
        gigoConfig.update("afk.on", true);

		//ensure that webview exists and render html
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
            this._view.webview.html = this._getHtmlForWebview(this._view.webview);
		}

		//if afk is not currently active on start call executeAfkCheck
		if (!afkActiveStart) {

			//executeAfkCheck sets current status to afk and retrieves the timestamp of when afk expires
			executeAfkCheck(
				this.cfg.workspace_id_string,
				this.cfg.secret,
				"60"
			).then((exp) => {
				this.logger.info.appendLine(`AFK Expires: ${exp} `);
				if (exp > 0){
					//ensures that webview exists and then sends afk timestamp to callback messenger
					if (this._view) {
						this._view.webview.postMessage({ type: "setExpirationAFK", value: exp });
						//display afk activated message
						vscode.window.showInformationMessage("GIGO AFK Session Activated");
						this.logger.info.appendLine(`Afk: Result pushed to afk session: ${exp}.`);
					}
					//vscode.window.showInformationMessage(`expiration: ${exp}`);
				}else{
					vscode.window.showInformationMessage("GIGO AFK Failed: PLEASE CHECK YOUR INTERNET CONNECTION AND TRY AGAIN");
					this.logger.error.appendLine(`Afk Failed: Result is empty or connection could not be resolved.`);
					this.disableAFK();
				}
			
			});

			
		}
	}

	//disabelAFK calls executeLiveCheck and rerenders page accordingly
	public disableAFK() {
		//settig up afk variables
		let afkActiveStart = this.afkActive;
		this.afkActive = false;

		//retrieve gigo config
		let gigoConfig = vscode.workspace.getConfiguration("gigo");
		gigoConfig.update("afk.on", false);

		//ensure that webview exists and then rerender html
		if (this._view) {
			this._view.show?.(true); // `show` is not implemented in 1.49 but is for 1.50 insiders
			this._view.webview.html = this._getHtmlForWebview(this._view.webview);
		}

		//if afk is active then executeLiveCheck
		if (afkActiveStart){
			//executeLiveCheck stes current timestamp to timestamp retrieved from http
			executeLiveCheck(this.cfg.workspace_id_string, this.cfg.secret);

			//display afk session deactivated
			vscode.window.showInformationMessage("GIGO AFK Session Deactivated");
			this.logger.info.appendLine(`Afk: Deactivated.`);
		}
       
	}

	//_getHtmlForWebview renders afk enbaled and disabled pages
	private _getHtmlForWebview(webview: vscode.Webview) {
        if (this.afkActive) {
            return this._getAfkEnabledHtml(webview);
        }
        return this._getAfkDisabledHtml(webview);
	}


	//_getAfkDisabledHtml renders page for when afk is disabled
    private _getAfkDisabledHtml(webview: vscode.Webview) {
        // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'afk', 'disabled_afk.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'afk', 'reset_afk.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'afk', 'vscode_afk.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'afk', 'main_afk.css'));

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
				<meta http-equiv="Content-Security-Policy" default-src * 'unsafe-inline' 'unsafe-eval'; script-src ${webview.cspSource} img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';>
				
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
				<br/>
				<br/>
				<text id="errors"></text>
				<br/>
				<br/>
				<div class="anim">
					<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script> 
					<lottie-player src="https://lottie.host/95676da9-1d6e-489a-bd6b-fdf154eacbbb/ApmRq8HOuu.json" background="transparent" speed="1" loop autoplay></lottie-player>
				</div>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
    }

	//_getAfkEnabledHtml renders page for when afk is enabled
    private _getAfkEnabledHtml(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'afk', 'enabled_afk.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'afk', 'reset_afk.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'afk', 'vscode_afk.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'afk', 'main_afk.css'));

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
				<meta http-equiv="Content-Security-Policy" default-src * 'unsafe-inline' 'unsafe-eval'; script-src ${webview.cspSource} img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';>
				
   
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
				<br/>
                <br/>
				<br/>
                <br/>
				<div class="anim">
					<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script> <lottie-player src="https://lottie.host/b975a4cd-1395-4b1c-aaa2-9f94f5937f4f/cdJEsmskbY.json" background="transparent" speed=".5" loop autoplay></lottie-player>
				</div>
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