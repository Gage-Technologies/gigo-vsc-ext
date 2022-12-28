import * as vscode from 'vscode';
import axios from "axios";

export let userHasBeenActive = false;
let nextTimeStamp = (Date.now()/1000) + (30 * 60);
let isAFK = false;
export async function activateTimeout(context: vscode.ExtensionContext) {
    // link callbacks for tracking user activity
    checkUserActivity();


    

    while(true){
        while(true){
            if (!isAFK){
                let currentTimeRemaining = nextTimeStamp - (Date.now()/1000);
                if (currentTimeRemaining <= 180){
                    break;
                }
            }
            
            await new Promise(f => setTimeout(f, 1000));
        }

        let isRenewed = (await renewPopup()).valueOf();

        if (!isRenewed && !isAFK){
            vscode.window.showInformationMessage("Session is being terminated due to inactivity");
            break;
            
            ///TODO send kill command
        }

        await executeLiveCheck("7311fb2a-f09b-4575-9ca2-254f7cbfeda6", "cd68f3ed9b605731d2cae49a41eeaf405e4a9d37b74c2a1e8f1ad08cc58a17ee");
        
        //console.log("time stamp: " + nextTimeStamp);
        
    }
   

    
    //renewPopup();

}

async function renewPopup(): Promise<boolean>{
    let timeRemaining = nextTimeStamp - (Date.now()/1000);
    let isRenewed = false;
    while(!isRenewed && timeRemaining > 0){
        console.log("user been active: " + userHasBeenActive)
        if (userHasBeenActive){
            vscode.window.showInformationMessage("Welcome back");
            isRenewed = true;
            return true;
        }
        vscode.window.showInformationMessage(`Are you still there?\n    session will auto close in ${Math.round(timeRemaining/60)} minutes`, "Continue session").then(selection => {
            vscode.window.showInformationMessage("Welcome back");
            isRenewed = true;
            return true;
        });
        
        await new Promise(f => setTimeout(f, 60000));
        timeRemaining = timeRemaining - 60;
    }

    return false;
}

export async function executeLiveCheck(wsID: any, secret: any){
    let res = await axios.post(
        "http://gigo.gage.intranet/api/internal/ws/live-check", 
        {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "coder_id": wsID,
            "secret": secret
        }
    );

    if (res.status !== 200) { 
        console.log("failed to execute live-check: ", res);
        return -1;
    }

    console.log("response print: ", res);


    console.log("json print: ", res.data);

    nextTimeStamp = res.data.expiration;
   // console.log("timestamp: " + nextTimeStamp)
}

export async function executeAfkCheck(wsID: any, secret: any, addMin: any){
    
    let res = await axios.post(
        "http://gigo.gage.intranet/api/internal/ws/afk", 
        {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "coder_id": wsID,
            "secret": secret,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            "add_min": addMin
        }
    );

    

    if (res.status !== 200) { 
        console.log("failed to execute live-check: ", res);
        return -1;
    }

    console.log("response print: ", res);


    console.log("json print: ", res.data);

    isAFK = true;
    
    return res.data.expiration;
   // console.log("timestamp: " + nextTimeStamp)
}

function activityCallback() {

    userHasBeenActive = true;
    vscode.commands.executeCommand("gigo.disableAFK");
    isAFK = false;
}

function checkUserActivity() {
    vscode.window.onDidChangeActiveTerminal(activityCallback);

    vscode.window.onDidChangeActiveTextEditor(activityCallback);

    vscode.window.onDidChangeTerminalState(activityCallback);

    vscode.window.onDidCloseTerminal(activityCallback);

    vscode.window.onDidOpenTerminal(activityCallback);

    vscode.window.onDidChangeTextEditorOptions(activityCallback);

    vscode.window.onDidChangeTextEditorSelection(activityCallback);

    vscode.window.onDidChangeTextEditorViewColumn(activityCallback);

    vscode.window.onDidChangeTextEditorVisibleRanges(activityCallback);

    vscode.window.onDidChangeVisibleTextEditors(activityCallback);

    // vscode.window.onDidChangeWindowState(activityCallback);
   
    // vscode.workspace.onDidChangeTextDocument(activityCallback);

    // vscode.workspace.onDidCloseTextDocument(activityCallback);

    // vscode.workspace.onDidOpenTextDocument(activityCallback);

    vscode.workspace.onDidChangeNotebookDocument(activityCallback);

    vscode.workspace.onDidCloseNotebookDocument(activityCallback);

    vscode.workspace.onDidOpenNotebookDocument(activityCallback);

    vscode.workspace.onDidCreateFiles(activityCallback);

    vscode.workspace.onDidDeleteFiles(activityCallback);
}