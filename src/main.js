// file: webview-ui/main.js

//import {Uri} from "vscode";

// import * as vscode2 from 'vscode';


const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {

  vscode.postMessage({
    command: "hello",
    text: "in main 🤠",
  });
    
  try{
    const previous = document.getElementById("previousTutorial");
  
    previous.addEventListener("click", previousMarkdown);
  }catch{}

  const next = document.getElementById("nextTutorial");
  
  next.addEventListener("click", nextMarkdown);

}


function nextMarkdown() {
  
  try{

    let currentNum = document.getElementsByName("currentPgNum");
    
    vscode.postMessage({
      command: "currentPage",
      text: `${parseInt(currentNum[0].value) + 1}`,
    });

   
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
}


function previousMarkdown() {
  try{

    let currentNum = document.getElementsByName("currentPgNum");
    
    vscode.postMessage({
      command: "currentPage",
      text: `${parseInt(currentNum[0].value) - 1}`,
    });

   
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
}