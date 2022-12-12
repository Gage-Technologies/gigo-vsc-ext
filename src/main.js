// file: webview-ui/main.js

//import {Uri} from "vscode";

// import * as vscode2 from 'vscode';


const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {

  
  
  // console.log("executiong main function");
  // const howdyButton = document.getElementById("howdy");
 
  // howdyButton.addEventListener("click", handleHowdyClick);

  vscode.postMessage({
    command: "hello",
    text: "in main 🤠",
  });
  

  const next = document.getElementById("nextTuitorial");
  
  next.addEventListener("click", nextMarkdown);

  
  

}

function handleHowdyClick() {
  console.log("executing button click");
  // const uri = vscode.Uri.file("README.md");
  // commands.executeCommand("markdown.showPreview", uri);
  vscode.postMessage({
    command: "hello",
    text: "Hey there partner! 🤠",
  });

 
}

function nextMarkdown() {
  try{
    
    let tuitorial2 = document.getElementById("test");
    document.getElementById("big").outerHTML="<div/>";
    document.getElementById("big").outerHTML=tuitorial2.innerText;
  }catch(e){
    vscode.postMessage({
          command: "hello",
          text: `${e}`,
        });
  }

  vscode.postMessage({
    command: "hello",
    text: "worked",
  });
    
  // vscode.postMessage({
  //   command: "hello",
  //   text: "Hey there partner! 🤠",
  // });

  // try {
  //   vscode.postMessage({
  //     command: "hello",
  //     text: "Hey there 2! 🤠",
  //   });
  //   //const t = shiki.loadTheme(join(process.cwd(), 'vscode.theme-kimbie-dark'));




  //   shiki.getHighlighter({
  //     theme: 'github-dark'
  //     }).then((highlighter) => {
  //       const md = markdown({
  //           html: true,
  //           highlight: (code, lang) => {
  //           return highlighter.codeToHtml(code, { lang });
  //           }
  //       });

  //       const html = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/tuitorial-2.md", 'utf-8'));
  //       const out = `
  //           <title>Shiki</title>
  //           <link rel="stylesheet" href="style.css">
  //           ${html}
  //           <script src="index.js"></script>
  //       `;

  //       window.webview.html = out;
  //       //currentPanel.webview.html = out;

  //       //vscode.commands.executeCommand("workbench.action.webview.reloadWebviewAction");

  //       console.log('done');
  //     },
  //   );
  // } catch(e) {
  //   vscode.postMessage({
  //     command: "hello",
  //     text: `import failure: ${e}`,
  //   });
  // }



  // console.log("here");
  // try {
  //   vscode.postMessage({
  //     command: "nextTuitorial",
  //     text: `VSCode\n${vscode.command}`,
  //   });
  // } catch (e) {
  //   vscode.postMessage({
  //     command: "hello",
  //     text: `Failed to update markdown\n${e}`,
  //   });
  // }

  // vscode.postMessage({
  //   command: "hello",
  //   text: "Updating Markdown File",
  // });

  //commands.executeCommand("markdown.showPreviewToSide", uri);
}