


function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);

    
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("Text");
    
    ev.target.appendChild(document.getElementById(data));
 
    
}

function dragElement(elmnt) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  var saveButton = elmnt.querySelector("#save-step-button");
  if (saveButton.style.display !== "none") {
    
    return;
  }
    // elmnt.style.position = "absolute";
    /* otherwise, move the DIV from anywhere inside the DIV:*/
    elmnt.onmousedown = dragMouseDown;
  

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
   
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
   
    
    
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    e.preventDefault();
   
    var trash = document.getElementById("trash");
    var textBoxEx = document.getElementById("ci-external");
    if (Math.abs(localToGlobal(trash).top - (localToGlobal(elmnt).top - window.scrollY)) < 50 && Math.abs(localToGlobal(trash).left - (localToGlobal(elmnt).left - window.scrollX)) < 50) {
      
      var icon = trash.querySelector(".trash-icon");
      icon.innerHTML = `<path class="trash-icon-path" d="M9 13v6c0 .552-.448 1-1 1s-1-.448-1-1v-6c0-.552.448-1 1-1s1 .448 1 1zm7-1c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm-4 0c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm4.333-8.623c-.882-.184-1.373-1.409-1.189-2.291l-5.203-1.086c-.184.883-1.123 1.81-2.004 1.625l-5.528-1.099-.409 1.958 19.591 4.099.409-1.958-5.667-1.248zm4.667 4.623v16h-18v-16h18zm-2 14v-12h-14v12h14z"/>`
      console.log(icon);
  
    }else{
      var icon = trash.querySelector(".trash-icon");
      icon.innerHTML = `<path class="trash-icon-path" d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/>`
   
    }

    
    
  }

  function closeDragElement() {
    elmnt.style.position = "absolute";
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
    handleCodeSteps();
    
  }
}




function selectTextareaWord(tarea, word) {
    const words = tarea.value.split(" ");
    const newLines = tarea.value.split("\n");
    // calculate start/end
    const startPos = tarea.value.indexOf(word),
      endPos = startPos + word.length
  
    if (typeof(tarea.selectionStart) != "undefined") {
      tarea.focus();
      tarea.selectionStart = startPos;
      tarea.selectionEnd = endPos;
      return startPos, endPos, newLines.length;
    }
  
    // IE
    if (document.selection && document.selection.createRange) {
      tarea.focus();
      tarea.select();
      var range = document.selection.createRange();
      range.collapse(true);
      range.moveEnd("character", endPos);
      range.moveStart("character", startPos);
      range.select();
      return true;
    }
  
    return false;
  }

  function getOffset(el) {
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY
    };
  }


