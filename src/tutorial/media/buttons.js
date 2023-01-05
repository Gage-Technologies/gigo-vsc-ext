


const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

// main() will be called when page is rendered
function main() {
  //add listeners for each button
  try{
    document.querySelector('.enable-gigo-tutorial-previous-button').addEventListener('click', () => {
      previousMarkdown();
    });

  }catch{}

  document.querySelector('.enable-gigo-tutorial-next-button').addEventListener('click', () => {
    nextMarkdown();
  });

  

  


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
          type: "hello",
          text: `${e}`,
        });
  }
}

function page(pageNum) {
  vscode.postMessage({
      command: "currentPage",
      text: pageNum,
  });
}



function pageButtons() {

  let button = document.getElementsByName(`page-${i+1}`)

  .addEventListener('click', () => {
    vscode.postMessage({
      command: "currentPage",
      text: `${i + 1}`,
    });
  });
}



function nextGroup() {
  vscode.postMessage({
    command: "nextGroup",
    text: "next",
  });
}

function lastGroup() {
  vscode.postMessage({
    command: "lastGroup",
    text: "last",
  });
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
          type: "hello",
          text: `${e}`,
        });
  }
}

