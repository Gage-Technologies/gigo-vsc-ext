


const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

// main() will be called when page is rendered
function main() {
  //add listeners for each button
  try{
    const previous = document.getElementById("previousTutorial");
  
    previous.addEventListener("click", previousMarkdown);
  }catch{}

  const next = document.getElementById("nextTutorial");
  
  next.addEventListener("click", nextMarkdown);

}


//nextMarkdown() on next tutorial button click increase page number and send to message handler
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
}


//previousMarkdown() on previous tutorial button click decrease page number and send to message handler
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
}