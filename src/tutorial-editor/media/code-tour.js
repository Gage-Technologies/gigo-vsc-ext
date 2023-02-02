



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
   
    

    
    
  }

  function closeDragElement() {
    /* stop moving when mouse button is released:*/
    document.onmouseup = null;
    document.onmousemove = null;
    handleCodeSteps();
    // var textBoxIn = document.getElementById("ci-internal");
    // var textBoxEx = document.getElementById("ci-external");
    
    
    // if (doElsCollide(elmnt, textBoxIn)) {

    //     let word = elmnt.id;
        
    //     if (textBoxEx.value.indexOf(word) === -1){
    //         textBoxEx.value += `\n${word}\n`;
    //     }

        
    //     // now you have a proper float for the font size (yes, it can be a float, not just an integer)
        
                
        
    //     var startPos, endPos, heightPos = selectTextareaWord(textBoxEx, word);

    //     startPos = textBoxEx.value.indexOf(word);
    //     endPos = word.length;

    //     var fontSize = parseInt(window.getComputedStyle(textBoxEx).fontSize)
    //     var lineHeight = parseInt(window.getComputedStyle(textBoxEx).lineHeight)

    //     const newLines = textBoxEx.value.split("\n");
    //     for (let i = 0; i < newLines.length; i++) {
    //         if (newLines[i].indexOf(word) !== -1){
    //             heightPos = i + 1;
    //         }
    //      } 
  
        
    //      var elmntClone = elmnt.cloneNode()
         
         
    //     //  elmnt.style.position = "fixed";

    //      elmnt.style.top = (getOffset(textBoxEx).top + (heightPos * lineHeight)) + "px";
    //      elmnt.style.left = (getOffset(textBoxEx).left + (word.length * fontSize - 40)) + "px";
    //      elmnt.ondragstart = function () { return false; };
    //      elmnt.draggable = false;

    //     //  elmnt.outerHTML = elmnt.outerHTML.replace(`<div id="@@@Step1@@@" draggable="true" ondragstart="dragElement(this)" class="code-steps" style="top: ${elmnt.style.top}; left: ${elmnt.style.left};">`, 
    //     //  `<div id="@@@Step1@@@" style="position: absolute; top: ${(getOffset(textBoxEx).top + (heightPos * lineHeight)) + "px"} left: ${(getOffset(textBoxEx).left + (7 * fontSize)) + "px"};" class="code-steps">`)
    //     //  elmnt.outerHTML = elmnt.outerHTML.replace(`ondragstart="dragElement(this)"`, `ondragstart="return false"`)
         
    //     textBoxEx.value += `                                                        ${getOffset(textBoxEx).top}\n`
    //     textBoxEx.value += `Height: ${getOffset(textBoxEx).top + (heightPos * lineHeight)}\n`
    //     //  textBoxEx.value += `diffed: <div id="@@@Step1@@@" style="position: absolute; top: ${(getOffset(textBoxEx).top + (heightPos * lineHeight)) + "px"} left: ${(getOffset(textBoxEx).left + (7 * fontSize)) + "px"};" class="code-steps">\n`
    //     //  textBoxEx.value += `<div id="@@@Step1@@@" draggable="true" ondragstart="dragElement(this)" class="code-steps" style="top: ${elmnt.style.top}; left: ${elmnt.style.left};">\n`
    //     textBoxEx.value += `boxwidth: ${getOffset(textBoxEx).left} boxHeight: ${getOffset(textBoxEx).top} start: ${startPos} end: ${endPos} height: ${heightPos} fontise: ${fontSize} lineheight: ${lineHeight} totalHeight: ${elmnt.style.top} totalWidth: ${elmnt.style.left}\n`;
    //      return;

    
    //     // var isSelected = selectTextareaWord(textBoxEx, "Step 1");
    //     // e.target.appendChild(document.createTextNode(`${isSelected}`));
       
    // }

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


