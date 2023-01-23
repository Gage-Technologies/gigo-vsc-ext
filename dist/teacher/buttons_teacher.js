const vscode = acquireVsCodeApi();

window.addEventListener("load", myFunction);


/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
    vscode.postMessage({
      type: "hello",
      text: `click`,
    });

}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
} 


function aboutFunc(){
  document.getElementById("aboutContent").classList.toggle("show");
  vscode.postMessage({
    type: "hello",
    text: `about`,
  });
}

function submitFunc(){
  vscode.postMessage({
    type: "hello",
    text: `about2`,
  });

  try{
    var code = document.getElementsByName("inputBox1")[0].value;
    var error = document.getElementsByName("inputBox2")[0].value;
  }catch(e){
    vscode.postMessage({
      type: "hello",
      text: `${e}`,
    });
  }

  
   vscode.postMessage({
    type: "hello",
    text: `${error}`,
  });
  if (error == "" || error == null) {
    vscode.postMessage({
      type: "hello",
      text: `GIGO Code Teacher: PLEASE FILL OUT THE ERROR FIELD`,
    });
    return;
  }




  vscode.postMessage({
    command: "loadingIcon",
    text: `enable`,
    value: {"code": code, "error": error},
  });
}