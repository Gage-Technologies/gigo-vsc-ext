// import * as vscode from 'vscode';
// const fetch = require('node-fetch');
// let nextTimeStamp = (Date.now()/1000) + (30 * 60);


// let userHasBeenActive = false;


// export async function activateTimeout(context: vscode.ExtensionContext) {
//     // link callbacks for tracking user activity
//     checkUserActivity();


//     console.log((await renewPopup()).valueOf());

//     while(true){
//         while(true){
//             let currentTimeRemaining = nextTimeStamp - (Date.now()/1000);
//             if (currentTimeRemaining <= 180){
//                 break;
//             }
//             await new Promise(f => setTimeout(f, 1000));
            
//         }

//         let isRenewed = (await renewPopup()).valueOf();

//         if (!isRenewed){
//             vscode.window.showInformationMessage("Session is being terminated due to inactivity");
//             break;
            
//             ///TODO send kill command
//         }

//         let res = await refreshRoutine("7311fb2a-f09b-4575-9ca2-254f7cbfeda6", "cd68f3ed9b605731d2cae49a41eeaf405e4a9d37b74c2a1e8f1ad08cc58a17ee");

//         console.log(res);
//     }
   

    
//     //renewPopup();

// }
    

// async function renewPopup(): Promise<boolean>{
//     let timeRemaining = nextTimeStamp - (Date.now()/1000);
//     let isRenewed = false;
//     while(!isRenewed && timeRemaining > 0){
//         console.log("user been active: " + userHasBeenActive)
//         if (userHasBeenActive){
//             vscode.window.showInformationMessage("Welcome back");
//             isRenewed = true;
//             return true;
//         }
//         vscode.window.showInformationMessage(`Are you still there?\n    session will auto close in ${Math.round(timeRemaining/60)} minutes`, "Continue session").then(selection => {
//             vscode.window.showInformationMessage("Welcome back");
//             isRenewed = true;
//             return true;
//         });
        
//         await new Promise(f => setTimeout(f, 1000));
//         timeRemaining = timeRemaining - 60;
//     }

   

//     return false;
// }



// async function refreshRoutine(wsID: any, secret: any){
//     let res = await fetch("http://gigo.gage.intranet/api/internal/ws/live-check", {
//         method: 'POST',
//         body: JSON.stringify({
//             "coder_id": wsID,
//             "secret": secret
//         }),
//         headers: {"Content-Type": "application/json"}
//     });

//     if (!res.ok) { 
//         console.log("failed to execute live-check: ", res);
//         return -1;
//     }

//     console.log("response print: ", res);

//     let jRes = await res.json();

//     console.log("json print: ", jRes);

//     return jRes["expiration"];
// }

// export function deactivate() {}
