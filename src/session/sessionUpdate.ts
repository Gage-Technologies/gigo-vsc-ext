import * as vscode from 'vscode';
import axios from "axios";

export let userHasBeenActive = false;
let nextTimeStamp = (Date.now()/1000) + (4 * 60);
let isAFK = false;
let errors = vscode.window.createOutputChannel("Extension Errors");
let debug = vscode.window.createOutputChannel("Extension Debug");
            

//activateTimeout is called when the extension is activated
export async function activateTimeout(context: vscode.ExtensionContext, cfg: any) {
    // link callbacks for tracking user activity
    checkUserActivity();

    errors.appendLine(nextTimeStamp.toString());
    
    //core loop iterates until user is inactive for a set amount of time
    while(true){
        //interior loop iterates until a sepcified time is remaining before the use is dtermined to be inactive
        while(true){
            //if the user is afk wait 1 second before checking again
            if (!isAFK){
                //determine time remaining before user is considered inactive
                let currentTimeRemaining = nextTimeStamp - (Date.now()/1000);
                //if user has less than or equal to 3 minutes remaining break from loop 
                if (currentTimeRemaining <= 180){
                    break;
                }
            }
            
            //wait 1 second before iterating again
            await new Promise(f => setTimeout(f, 1000));
        }

        console.log("calling renewpopup");
        //prompt user that with inactive pop-up and display time remaining before session timeout
        let isRenewed = (await renewPopup()).valueOf();
        console.log(`isRenewed: ${isRenewed}`);

        //if the user is not afk and is still inactive terminate the session
        if (!isRenewed && !isAFK){
            vscode.window.showInformationMessage("Session is being terminated due to inactivity");
            break;
        }
        
        console.log("CALLING LIVE CHECK");
        //if user is not afk but is active call live check to renew session timer
        let res = await executeLiveCheck(cfg.workspace_id_string, cfg.secret);
        
        console.log(`LIVE CHECK COMPLETED: ${nextTimeStamp}`);

        if (res){
            vscode.window.showInformationMessage("Session is being terminated due to inactivity");
            break;
        }
    }
}


//renewPopup will continously displaya popup every minute prompting the user to renew session or session will end
async function renewPopup(): Promise<boolean>{
    //determine time remaining
    let timeRemaining = nextTimeStamp - (Date.now()/1000);
    let isRenewed = false;

    //if the user has not renewed the session and there is time remaining continue looping
    while(!isRenewed && timeRemaining > 0){
        //if the user has been active display welcome back message, break from loop, and return true
        if (userHasBeenActive){
            vscode.window.showInformationMessage("Welcome back");
            isRenewed = true;
            return true;
        }
        //if the user has not been active dip1674382421ay 'are you still there' message
        vscode.window.showInformationMessage(`Are you still there?\n    session will auto close in ${Math.round(timeRemaining/60)} minutes`, "Continue session").then(selection => {
            //if user clicks continue button display welcome message, break from loop, and return true
            vscode.window.showInformationMessage("Welcome back");
            isRenewed = true;
            return true;
        });
        
        //wait for 1 minute before checking again
        await new Promise(f => setTimeout(f, 60000));
        //reduce time remaining by 1 minute
        timeRemaining = timeRemaining - 60;
    }

    //time remaining is 0 and user has not been active, return false
    return false;
}


//executeLiveCheck will execute a live check to renew session timer by calling http function in GIGO
export async function executeLiveCheck(wsID: any, secret: any){
    var res: any;
    for(let i = 0; i < 3; i++){
        try{
            //await result from http function in GIGO
            let res = await axios.post(
                "http://gigo.gage.intranet/api/internal/ws/live-check", 
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "workspace_id": wsID,
                    "secret": secret
                }
            );

            errors.appendLine(`res: ${res.data.expiration}: ${res.status}`);

            // //if non status code 200 is returned, return -1 and log failure message
            // if (res.status !== 200) { 
            //     errors.appendLine(`failed to executeLiveCheck: ${res}`);
            //     continue;
            // }
            errors.appendLine(`res: ${res}`);
            
        }catch(e){
            errors.appendLine(`failed to executeLiveCheck: ${e}`);
            await new Promise(f => setTimeout(f, 1000));
            continue;
        }
        
        break;
    }

    

    try{
        console.log("live check: ", res.data);
        if (res.data.expiration <= 0){
            return -1;
        }
    }catch(e){
        return -1;
    }

    debug.appendLine(`next live check: ${res.data.expiration}`);
    
    //set next timeout to timestamp retrieved from http call
    nextTimeStamp = res.data.expiration;
}


//executeAfkCheck will execute a call to get an afk session timestamp from the http function in GIGO
export async function executeAfkCheck(wsID: any, secret: any, addMin: any){

    var res: any;
    for (let i = 0; i < 3; i++){
        try{
            //awair result from http function in GIGO
            let res = await axios.post(
                "http://gigo.gage.intranet/api/internal/ws/afk", 
                {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "workspace_id": wsID,
                    "secret": secret,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "add_min": addMin
                }
            );
            errors.appendLine(`res: ${res.data.expiration}: ${res.status}`);
                //if non status code 200 is returned, return -1 and log failure message
                // if (res.status !== 200) { 
                //     errors.appendLine(`failed to executeAfkCheck: ${res}`);
                //     return -1;;
                // }
            
        }catch(e){
            errors.appendLine(`failed to executeAfkCheck: ${e}`);
            await new Promise(f => setTimeout(f, 1000));
            continue;
        }

        
    

        break;
    }
  
    try{
        if (res.data.expiration <= 0){
            isAFK = false;
            return -1;
        }
    }catch(e){
        isAFK = false;
        return -1;
    }

    //set afk variable to true
    isAFK = true;
    

    errors.appendLine(`res2: ${res.data.expiration}: ${res.status}`);
    //return afk timestamp
    return res.data.expiration;
}


//activityCallback is called upon user interaction and sets states to user active
function activityCallback() {
    if (!userHasBeenActive){
        vscode.window.showInformationMessage("Welcome back");
    }

    // vscode.window.showInformationMessage("activity logged");

    //set user active to true
    userHasBeenActive = true;
    if (isAFK) {
        
        //execute disable afk command
        vscode.commands.executeCommand("gigo.disableAFK");
        vscode.window.showInformationMessage("Welcome back");
    }
    //set is afk to false
    isAFK = false;
}


//checkUserActivity is a callback funtion that occurs whenever a user does a recognizable input
function checkUserActivity() {
    
    //all callback functions call activityCallback on registered input
    vscode.window.onDidChangeActiveTerminal(activityCallback);

    vscode.window.onDidChangeActiveTextEditor(activityCallback);

    vscode.window.onDidChangeTerminalState(activityCallback);

    vscode.window.onDidCloseTerminal(activityCallback);

    vscode.window.onDidOpenTerminal(activityCallback);

    vscode.window.onDidChangeTextEditorOptions(activityCallback);

    // vscode.window.onDidChangeTextEditorSelection(activityCallback);

    vscode.window.onDidChangeTextEditorViewColumn(activityCallback);

    // vscode.window.onDidChangeTextEditorVisibleRanges(activityCallback);

    vscode.window.onDidChangeVisibleTextEditors(activityCallback);

    //TODO
    // vscode.window.onDidChangeWindowState(activityCallback);
   
    // vscode.workspace.onDidChangeTextDocument(activityCallback);

    // vscode.workspace.onDidCloseTextDocument(activityCallback);

    // vscode.workspace.onDidOpenTextDocument(activityCallback);
    //TODO

    vscode.workspace.onDidChangeNotebookDocument(activityCallback);

    vscode.workspace.onDidCloseNotebookDocument(activityCallback);

    vscode.workspace.onDidOpenNotebookDocument(activityCallback);

    vscode.workspace.onDidCreateFiles(activityCallback);

    vscode.workspace.onDidDeleteFiles(activityCallback);
}