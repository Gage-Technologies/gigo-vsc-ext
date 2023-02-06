


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
    if (doElsCollide(elmnt, trash)) {
      var icon = trash.querySelector("trash-icon");
      console.log(icon);
  
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

doElsCollide = function(el1, el2) {
    el1.offsetBottom = el1.offsetTop + el1.offsetHeight;
    el1.offsetRight = el1.offsetLeft + el1.offsetWidth;
    el2.offsetBottom = el2.offsetTop + el2.offsetHeight;
    el2.offsetRight = el2.offsetLeft + el2.offsetWidth;
    
    return !((el1.offsetBottom < el2.offsetTop) ||
             (el1.offsetTop > el2.offsetBottom) ||
             (el1.offsetRight < el2.offsetLeft) ||
             (el1.offsetLeft > el2.offsetRight))
};


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


