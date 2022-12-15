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

  const previous = document.getElementById("previousTuitorial");
  
  previous.addEventListener("click", previousMarkdown);

  
  

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

    let currentNum = document.getElementById("currentPgNum");

    vscode.postMessage({
      command: "hello",
      text: `${currentNum.innerText}`,
    });


    var currentNumNum = +currentNum.innerText;
    vscode.postMessage({
      command: "hello",
      text: `${currentNumNum}`,
    });
    ++currentNumNum;
    
    let tuitorial2 = document.getElementById(`t-${currentNumNum}`);
    // document.getElementById("big").outerHTML="<div/>";
    document.getElementById("big").outerHTML=tuitorial2.innerText;

    vscode.postMessage({
      command: "currentPage",
      text: `${currentNumNum + 1}`,
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

    let currentNum = document.getElementById("currentPgNum");

    vscode.postMessage({
      command: "hello",
      text: `${currentNum.innerText}`,
    });


    var currentNumNum = +currentNum.innerText;
    --currentNumNum;
    
    let tuitorial2 = document.getElementById(`t-${currentNumNum}`);
    // document.getElementById("big").outerHTML="<div/>";
    document.getElementById("big").outerHTML=tuitorial2.innerText;

    vscode.postMessage({
      command: "currentPage",
      text: `${currentNumNum + 1}`,
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