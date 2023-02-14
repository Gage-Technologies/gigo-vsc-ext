// CodeInput
// by WebCoder49


// Based on a CSS-Tricks Post
const vscode = acquireVsCodeApi();

window.addEventListener("load", loadCodeTours);




function helloWrld(){
    console.log("HELLO WORLD")
}


function addCodeTour(button){

    try{
        
        var popCon = document.getElementById("pop-container");
        console.log(popCon.style.display);
        if (popCon.style.display === "inline-block"){
            var tourNum = document.getElementById("tour-step-num");

            document.getElementById(`@@@Step${tourNum.value}@@@`).remove();
            tourNum.value = parseInt(tourNum.value) - 1;
            popCon.style.display = "none";
            
            return;
        }
        var randomColor = Math.floor(Math.random()*16777215).toString(16);

        var step = document.getElementById("@@@Step0@@@");

        var tourNum = document.getElementById("tour-step-num");
        
        tourNum.value = parseInt(tourNum.value) + 1;

        vscode.postMessage({
            type: 'hello',
            message: `tourNum ${tourNum.value}`
        });

        let stepClone = step.cloneNode(true);
        stepClone.id = `@@@Step${tourNum.value}@@@`;

        stepClone.style.display = "inline-block";

        var innerStep = stepClone.querySelector(".code-steps-inner");
        innerStep.style.backgroundColor = "#" + randomColor;

        var title = stepClone.querySelector(".code-steps-inner").querySelector(".step-title");

        title.innerHTML = `<b>Step ${tourNum.value}</b>`;
        // stepClone.querySelector("#div.code-steps-inner > span > b")

        // vscode.postMessage({
        //     type: 'hello',
        //     message: `title ${title.innerHTML}`
        // });
        // title.textContent = "Step 1";

        

        var popCon = document.getElementById("pop-container");
        


        popCon.style.display = "inline-block";
        popCon.style.display = "inline-block";


        // vscode.postMessage({
        //     type: 'hello',
        //     message: `displaying background add pop: ${popCon.style.display}`
        // });

        stepClone.style.display = "inline-block";
        step.parentElement.appendChild(stepClone);
    
    
        // vscode.postMessage({
        //     type: 'hello',
        //     message: `${stepClone}`
        // })
    
    }catch(e){
        vscode.postMessage({
            type: 'hello',
            message: e
        })
    }
   

    vscode.postMessage({
        type: 'addCodeTour'
    });
}

function loadCodeTours(){
    console.log("inside load code tours");
    try{
        var steps = document.getElementById("tour-step-objs").value;
        
        steps = JSON.parse(steps);
        console.log(`this is the steps inside load code tours: ${steps[0]}`);
        vscode.postMessage({
            type: 'hello',
            message: `in side load code tours ${steps}`
        })
        // var tourPath = document.getElementById("tour-path").value;
        // let tour = fs.readFileSync(tourPath, 'utf-8');
        // let ts = JSON.parse(tour);
        // var steps = ts.steps;
    }catch(e){
        console.log(e);
    }
    
    console.log(`this is post message in load code tours length of steps: ${steps.length}`);
    for (let i = 0; i < steps.length; i++) {
        var randomColor = Math.floor(Math.random()*16777215).toString(16);

        var step = document.getElementById("@@@Step0@@@");
        

        let stepClone = step.cloneNode(true);
        stepClone.id = `@@@Step${i + 1}@@@`;

        console.log(`this is the step in iter: ${stepClone.id}`);

       
        var innerStep = stepClone.querySelector(".code-steps-inner");
        innerStep.style.backgroundColor = "#" + randomColor;
        var title = stepClone.querySelector(".code-steps-inner").querySelector(".step-title");

        title.innerHTML = `<b>Step ${i + 1}</b>`;

        var filePath = stepClone.querySelector("#file-path-div").querySelector("#file-path");
        filePath.value = steps[i].file;

        var lineNumber = stepClone.querySelector("#line-number-div").querySelector("#line-number");
        lineNumber.value = steps[i].line;

        var description = stepClone.querySelector("#description-div").querySelector("#description-input");
        description.value = steps[i].description;

        stepClone.style.display = "inline-block";
        step.parentElement.appendChild(stepClone);

        var filePathDiv = stepClone.querySelector("#file-path-div")
        var lineNumberDiv = stepClone.querySelector("#line-number-div")
        var descriptionDiv = stepClone.querySelector("#description-div")
        var saveButton = stepClone.querySelector('#save-step-button');
        var textBoxEx = document.getElementById("ci-external");
        var textBoxIn = document.getElementById("ci-internal");
        var word = stepClone.id;
        var elmnt = stepClone;

        console.log(`this is the step in iter2: ${stepClone.id}`);

        filePathDiv.style.display = "none";
        lineNumberDiv.style.display = "none";
        descriptionDiv.style.display = "none";
        saveButton.style.display = "none";
        stepClone.style.height = "3%";

        var caretPos = textBoxIn.selectionStart;
            
        if (textBoxEx.value.indexOf(word) === -1){
            console.log(caretPos)


            textBoxEx.value = textBoxEx.value.substring(0, caretPos) + `\n${word}` + textBoxEx.value.slice(caretPos)


            console.log(`caret ${textBoxEx.value.substring(0, caretPos)}`)
            console.log("rest of string: ", textBoxEx.value.slice(`${word}`.length))
            console.log(textBoxEx.value);
            //textBoxEx.value += `\n${word}\n`;
        }
        
        // now you have a proper float for the font size (yes, it can be a float, not just an integer)
        var fontSize = parseInt(window.getComputedStyle(textBoxEx).fontSize)
        var lineHeight = parseInt(window.getComputedStyle(textBoxEx).lineHeight)

        var charsBefore = 0
        const newLines = textBoxEx.value.split("\n");
        for (let i = 0; i < newLines.length; i++) {
            if (newLines[i].indexOf(word) !== -1){
                heightPos = i + 1;
            }
        } 

        for (let i = 0; i < newLines.length; i++) {
            if (newLines[i].indexOf(word)!== -1){
                break;
            }
            charsBefore += newLines[i].length + 1;
        }

        console.log(`postr newline calc`);
        var startPos = (textBoxEx.value.indexOf(word));
        var endPos = (startPos + word.length) - charsBefore;

        var top = (getOffset(textBoxEx).top + (heightPos * lineHeight))
        var left = (getOffset(textBoxEx).left + (endPos * fontSize))

        // if (top > rect.height || left > rect.width || left > rect.width){ 
        //     elmnt.style.top = (getOffset(textBoxEx).top) + "px";
        //     elmnt.style.left = (getOffset(textBoxEx).left) + "px";
        //     handleCodeSteps();
        // }
        
        console.log(`postr newline calc2`);
        
        //  elmnt.style.position = "fixed";

        stepClone.style.top = (getOffset(textBoxEx).top + (heightPos * lineHeight)+5) + "px";
        stepClone.style.left = (getOffset(textBoxEx).left + (endPos * fontSize) + 13) + "px";
        stepClone.style.position = "absolute";

        console.log(`loading step: ${stepClone.id} into pos: ${stepClone.style.top}, ${stepClone.style.left}`);
        // elmnt.ondragstart = function () { return false; };
       

    }

    // console.log(`load handle code steps`);
    // handleCodeSteps();
    // console.log(`after load handle code steps`);
}

function deleteStep(elmnt){
    vscode.postMessage({
        type: 'deleteCodeTour',
    });
}


function editStep(button){
    // console.log(event);
 
    var codeStep = button.parentElement;

    var filePath = codeStep.querySelector('#file-path');
    var lineNumber = codeStep.querySelector('#line-number');
    

    var filePathDiv = codeStep.querySelector('#file-path-div');
    var lineNumberDiv = codeStep.querySelector('#line-number-div');
    var descriptionDiv = codeStep.querySelector('#description-div');

    var saveButton = codeStep.querySelector('#save-step-button');
    saveButton.style.display = 'inline-block';

    


    // vscode.postMessage({
    //     type: 'hello',
    //     message: `edit step id: ${codeStep.id}`,
    // });

    // codeStep.style.position = "fixed";
    filePathDiv.style.display = "inline-block";
    lineNumberDiv.style.display = "inline-block";
    button.style.display = "inline-block";
    descriptionDiv.style.display = "inline-block";
    codeStep.style.height = "25%";
    var rect = codeStep.getBoundingClientRect();
    if (rect.height < 224){
        codeStep.style.height = "224px";
    }

    button.style.display = "none";
}

function saveStep(button) {


    var codeStep = button.parentElement;

    var filePath = codeStep.querySelector('#file-path');
    var lineNumber = codeStep.querySelector('#line-number');
    var description = codeStep.querySelector('#description-input');

    var filePathDiv = codeStep.querySelector('#file-path-div');
    var lineNumberDiv = codeStep.querySelector('#line-number-div');
    var descriptionDiv = codeStep.querySelector('#description-div');
    var step = codeStep.id;

    var popUp = document.getElementById('pop-container');

    if (filePath.value === "" || lineNumber.value === "") {
        vscode.postMessage({
            type: 'hello',
            message: "Please ensure that you filled in the mandatory fields!",
        });
        return;
    }
    

    var num = step.replaceAll("@", "");
    var num = num.replace("Step", "");


    // vscode.postMessage({
    //     type: 'hello',
    //     message: `save step id: ${codeStep.id}`,
    // });

    // codeStep.style.position = 'absolute';
    
    // vscode.postMessage({
    //     type: 'hello',
    //     message: `${filePath}`,
    // });
    let mes = {
        file: filePath.value,
        line: lineNumber.value,
        description: description.value,
        step: num
    };

    filePathDiv.style.display = "none";
    lineNumberDiv.style.display = "none";
    descriptionDiv.style.display = "none";
    button.style.display = "none";
    codeStep.style.height = "3%";
    codeStep.style.zIndex = "20";
    // popUp.style.display = "none";
    

    
    vscode.postMessage({
        type: 'saveTourStep',
        message: `${JSON.stringify(mes)}`
    });
}

//TODO IF WEIRD BEHAVIOR HAPPENS WITH MULTIPLES CHECK HERE
function expandStep(ev, step){
    ev.preventDefault();
    var editButton = step.querySelector('#edit-step-button');
    var stepButton = step.querySelector('#save-step-button');
    
    if (stepButton.style.display !== "none"){
     
        return;
    }


    
    
    // vscode.postMessage({
    //     type: 'hello',
    //     message: `the id of the expanded step: ${step.id}`,
    // });

    // vscode.postMessage({
    //     type: 'hello',
    //     message: `${step.style.height.value}`,
    // });
 

    if (editButton.style.display === "none"){
        step.style.zIndex = "25";
        step.style.height = "8%";
        var rect = step.getBoundingClientRect();
        console.log(rect.height);
        if (rect.height < 70){
            step.style.height = "70px";
        }
        editButton.style.display = "inline-block";
        
        return;
    }

    editButton.style.display = "none";
    console.log("closing edit button")
    var editButton = document.getElementById('edit-step-button');
    step.style.height = "3%";
    step.style.zIndex = "20";
  
   
   
}

var codeInput = {
    observedAttributes: [
        "value", 
        "placeholder", 
        "lang", 
        "template",
        "onchange",
        "onselectionchange"
    ],
    // Attributes to monitor - needs to be global and static
    
    /* Templates */
    usedTemplates: {
    },
    defaultTemplate: undefined,
    templateQueue: {}, // lists of elements for each unrecognised template
    
    /* Plugins */
    plugins: { // Import a plugin from the plugins folder and it will be saved here.
    },
    Plugin: class {
        constructor() {
            console.log("code-input: plugin: Created plugin!");
            
            // Add attributes
            codeInput.observedAttributes = codeInput.observedAttributes.concat(self.observedAttributes);
        }

        /* Runs before code is highlighted; Params: codeInput element) */
        beforeHighlight(codeInput) {}
        /* Runs after code is highlighted; Params: codeInput element) */
        afterHighlight(codeInput) {}
        /* Runs before elements are added into a `code-input`; Params: codeInput element) */
        beforeElementsAdded(codeInput) {}
        /* Runs after elements are added into a `code-input` (useful for adding events to the textarea); Params: codeInput element) */
        afterElementsAdded(codeInput) {}
        /* Runs when an attribute of a `code-input` is changed (you must add the attribute name to observedAttributes); Params: codeInput element, name attribute name, oldValue previous value of attribute, newValue changed value of attribute) */
        attributeChanged(codeInput, name, oldValue, newValue) {}
        observedAttributes = []
    },
    
    /* Main */
    CodeInput: class extends HTMLElement { // Create code input element
        constructor() {
            super(); // Element
        }

        last_events = {}; // Last events applied; removed when changed so can be added to textarea, etc.

        /* Run this event in all plugins with a optional list of arguments */
        plugin_evt(id, args) {
            // Run the event `id` in each plugin
            for (let i in this.template.plugins) {
                let plugin = this.template.plugins[i];
                if (id in plugin) {
                    if(args === undefined) {
                        plugin[id](this);
                    } else {
                        plugin[id](this, ...args);
                    }
                }
            }
        }

        /* Syntax-highlighting functions */
        update(text) {
            if(this.value != text) this.value = text; // Change value attribute if necessary.
            if(this.querySelector("textarea").value != text) this.querySelector("textarea").value = text; 


            let result_element = this.querySelector("pre code");
           
    
            // Handle final newlines (see article)
            if (text[text.length - 1] == "\n") {
                text += " ";
            }

            text = text.replace(/["]/g, `'`);

            // Update code
            result_element.innerHTML = this.escape_html(text);
            this.plugin_evt("beforeHighlight");

            // Syntax Highlight
            if(this.template.includeCodeInputInHighlightFunc) this.template.highlight(result_element, this);
            else this.template.highlight(result_element);
           
            this.plugin_evt("afterHighlight");


            //TODO MY CODE FOR RESIZING BOX
            var textarea = this.querySelector("textarea");
            var pre = this.querySelector("pre");
            
            console.log(getComputedStyle(this).height);
            // this.style.height = textarea.scrollHeight  + "px";;
            this.style.height = textarea.scrollHeight  + "px";;
            pre.style.height = textarea.scrollHeight + "px";
            textarea.style.height = this.style.height;


            ////
            // this.style.height =  textarea.scrollHeight + 10  + "px";
            ///
            // alignCodeSteps();
            // handleCodeSteps();
            /////////////////////////////////////////
            

            vscode.postMessage({
                type: 'updateFile',
                message: `${text}`
            });

            

            
        }

        sync_scroll() {
            /* Scroll result to scroll coords of event - sync with textarea */
            let input_element = this.querySelector("textarea");
            let result_element = this.template.preElementStyled ? this.querySelector("pre") : this.querySelector("pre code");
            // Get and set x and y
            result_element.scrollTop = input_element.scrollTop;
            result_element.scrollLeft = input_element.scrollLeft;

            // try{
            //     handleCodeSteps(elmnt);
            // }catch(e){
            //     vscode.postMessage({
            //         type: 'hello',
            //         message: `${e}`
            //     });
            // }
        }

        escape_html(text) {
            return text.replace(new RegExp("&", "g"), "&amp;").replace(new RegExp("<", "g"), "&lt;"); /* Global RegExp */
        }

        /* Get the template for this element or add to the unrecognised template queue. */
        get_template() {
            // Get name of template
            let template_name;
            if(this.getAttribute("template") == undefined) {
                // Default
                template_name = codeInput.defaultTemplate;
            } else {
                template_name = this.getAttribute("template");
            }
            // Get template
            if(template_name in codeInput.usedTemplates) {
                return codeInput.usedTemplates[template_name];
            } else {
                // Doesn't exist - add to queue
                if( !(template_name in codeInput.templateQueue)) {
                    codeInput.templateQueue[template_name] = [];
                }
                codeInput.templateQueue[template_name].push(this);
                return undefined;
            }
            codeInput.usedTemplates[codeInput.defaultTemplate]
        }
        /* Set up element when a template is added */
        setup() {
            this.classList.add("code-input_registered"); // Remove register message
            if(this.template.preElementStyled) this.classList.add("code-input_pre-element-styled");

            this.plugin_evt("beforeElementsAdded");

            /* Defaults */
            let lang = this.getAttribute("lang");
            let placeholder = this.getAttribute("placeholder") || this.getAttribute("lang") || "";
            let value = this.value || this.innerHTML || "";
    
            this.innerHTML = ""; // Clear Content
    
            /* Create Textarea */
            let textarea = document.createElement("textarea");
            textarea.setAttribute("id", "ci-internal");
            textarea.placeholder = placeholder;
            textarea.value = value;
            textarea.setAttribute("spellcheck", "false");
    
            if (this.getAttribute("name")) {
                textarea.setAttribute("name", this.getAttribute("name")); // for use in forms
                this.removeAttribute("name");
            }
    

            textarea.addEventListener("keydown", (e) => {
                e.stopPropagation
                alignCodeSteps();
            });

            textarea.addEventListener("submit", (e) => {
                e.stopPropagation
                alignCodeSteps();
            });
        
            // textarea.setAttribute("onkeydown", "helloWrld();");
            // textarea.setAttribute("onsubmit", "helloWrld();");
            textarea.setAttribute("draggable", "false");
            textarea.setAttribute("ondragstart", "return false");


            textarea.setAttribute("oninput", "this.parentElement.update(this.value); this.parentElement.sync_scroll();");
            textarea.setAttribute("onscroll", "this.parentElement.sync_scroll();");
            this.append(textarea);

            /* Create pre code */
            let code = document.createElement("code");
            let pre = document.createElement("pre");
            pre.setAttribute("aria-hidden", "true"); // Hide for screen readers
            pre.append(code);
            this.append(pre);

            if(this.template.isCode) {
                if(lang != undefined && lang != "") {
                    code.classList.add("language-" + lang);
                }
            }
            
            this.plugin_evt("afterElementsAdded");

            // Events
            textarea = this.querySelector("textarea");
            // Add event listeners, bound so `this` can be referenced
            this.transfer_event("change", this.querySelector("textarea"), null, this.onchange);
            this.transfer_event("selectionchange", this.querySelector("textarea"), null, this.onselectionchange);

            /* Add code from value attribute - useful for loading from backend */
            console.log("loading default value into text area: ", value)
            this.update(value, this);
        }
        
        /* Callbacks */
        connectedCallback() {
            // Added to document
            this.template = this.get_template();
            if(this.template != undefined) this.setup();
        }
        static get observedAttributes() {         
            return codeInput.observedAttributes;
        }
        
        attributeChangedCallback(name, oldValue, newValue) {
            if(this.isConnected) {
                // This will sometimes be called before the element has been created, so trying to update an attribute causes an error.
                // Thanks to Kevin Loughead for pointing this out.
                
                this.plugin_evt("attributeChanged", [name, oldValue, newValue]); // Plugin event
                switch (name) {
    
                    case "value":
    
                        // Update code
                        this.update(newValue);
        
                        break;
        
                    case "placeholder":
                        this.querySelector("textarea").placeholder = newValue;
                        break;
                    case "template":
                        this.template = codeInput.usedTemplates[newValue || codeInput.defaultTemplate];
                        if(this.template.preElementStyled) this.classList.add("code-input_pre-element-styled");
                        else this.classList.remove("code-input_pre-element-styled");
                        // Syntax Highlight
                        this.update(this.value);

                        break;
    
                    case "lang":
                        let code = this.querySelector("pre code");
                        let main_textarea = this.querySelector("textarea");
                        
                        // Case insensitive
                        oldValue = oldValue.toLowerCase();
                        newValue = newValue.toLowerCase();
    
                        // Remove old language class and add new
                        console.log("code-input: Language: REMOVE", "language-" + oldValue);
                        code.classList.remove("language-" + oldValue); // From CODE
                        code.parentElement.classList.remove("language-" + oldValue); // From PRE
                        code.classList.remove("language-none"); // Prism
                        code.parentElement.classList.remove("language-none"); // Prism
                        
                        if(newValue != undefined && newValue != "") {
                            code.classList.add("language-" + newValue);
                            console.log("code-input: Language:ADD", "language-" + newValue);
                        }
                        
                        if(main_textarea.placeholder == oldValue) main_textarea.placeholder = newValue;
    
                        this.update(this.value);

                        break;

                    // Events
                    case "onchange":
                        this.transfer_event("change", this.querySelector("textarea"), oldValue, newValue);
                        break;
                    case "onselectionchange":
                        this.transfer_event("selectionchange", this.querySelector("textarea"), oldValue, newValue);
                        break;
                }
            }
            
        }

        /* Transfer an event by name from this to an inner element. */
        transfer_event(evt_name, transfer_to, oldValue, newValue) {
            // Doesn't exist
            if(oldValue) {
                transfer_to.removeEventListener(evt_name, this.last_events[evt_name]);
            }
            if(newValue) {
                this.last_events[evt_name] = this.onchange.bind(this);
                transfer_to.addEventListener(evt_name, this.last_events[evt_name]);
                this[`on${evt_name}`] = undefined; // Prevent duplicate
            }
        }

        /* Value attribute */
        get value() {
            return this.getAttribute("value");
        }
        set value(val) {
            return this.setAttribute("value", val);
        }
        /* Placeholder attribute */
        get placeholder() {
            return this.getAttribute("placeholder");
        }
        set placeholder(val) {
            return this.setAttribute("placeholder", val);
        }
    },
    
    registerTemplate: function(template_name, template) {
        // Set default class
        codeInput.usedTemplates[template_name] = template;
        // Add elements w/ template from queue
        if(template_name in codeInput.templateQueue) {
            for(let i in codeInput.templateQueue[template_name]) {
                elem = codeInput.templateQueue[template_name][i];
                elem.template = template;
                elem.setup();
            }
            console.log(`code-input: template: Added existing elements with template ${template_name}`);
        }
        if(codeInput.defaultTemplate == undefined) {
            codeInput.defaultTemplate = template_name;
            // Add elements w/ default template from queue
            if(undefined in codeInput.templateQueue) {
                for(let i in codeInput.templateQueue[undefined]) {
                    elem = codeInput.templateQueue[undefined][i];
                    elem.template = template;
                    elem.setup();
                }
            }
            console.log(`code-input: template: Set template ${template_name} as default`);
        }
        console.log(`code-input: template: Created template ${template_name}`);
    },
    templates: {
        custom(highlight=function() {}, preElementStyled=true, isCode=true, includeCodeInputInHighlightFunc=false, plugins=[]) {
            return {
                highlight: highlight, 
                includeCodeInputInHighlightFunc: includeCodeInputInHighlightFunc,
                preElementStyled: preElementStyled,
                isCode: isCode,
                plugins: plugins,
            };
        },
        prism(prism, plugins=[]) { // Dependency: Prism.js (https://prismjs.com/)
            return {
                includeCodeInputInHighlightFunc: false,
                highlight: prism.highlightElement, 
                preElementStyled: true,
                isCode: true,
                plugins: plugins,
            };
        },
        hljs(hljs, plugins=[]) { // Dependency: Highlight.js (https://highlightjs.org/)
            return {
                includeCodeInputInHighlightFunc: false,
                highlight: hljs.highlightElement, 
                preElementStyled: false,
                isCode: true,
                plugins: plugins,
            };
        },
        characterLimit() {
            return {
                highlight: function(result_element, code_input, plugins=[]) {

                    let character_limit = Number(code_input.getAttribute("data-character-limit"));

                    let normal_characters = code_input.escape_html(code_input.value.slice(0, character_limit));
                    let overflow_characters = code_input.escape_html(code_input.value.slice(character_limit));
                    
                    result_element.innerHTML = `${normal_characters}<mark class="overflow">${overflow_characters}</mark>`;
                    if(overflow_characters.length > 0) {
                        result_element.innerHTML += ` <mark class="overflow-msg">${code_input.getAttribute("data-overflow-msg") || "(Character limit reached)"}</mark>`;
                    }
                },
                includeCodeInputInHighlightFunc: true,
                preElementStyled: true,
                isCode: false,
                plugins: plugins,
            }
        },
        rainbowText(rainbow_colors=["red", "orangered", "orange", "goldenrod", "gold", "green", "darkgreen", "navy", "blue",  "magenta"], delimiter="", plugins=[]) {
            return {
                highlight: function(result_element, code_input) {
                    let html_result = [];
                    let sections = code_input.value.split(code_input.template.delimiter);
                    for (let i = 0; i < sections.length; i++) {
                        html_result.push(`<span style="color: ${code_input.template.rainbow_colors[i % code_input.template.rainbow_colors.length]}">${code_input.escape_html(sections[i])}</span>`);
                    }
                    result_element.innerHTML = html_result.join(code_input.template.delimiter);
                },
                includeCodeInputInHighlightFunc: true,
                preElementStyled: true,
                isCode: false,
                rainbow_colors: rainbow_colors,
                delimiter: delimiter,
                plugins: plugins,
            }
        }
    }
}

customElements.define("code-input", codeInput.CodeInput); // Set tag



function dragElement(elmnt) {
    console.log(`element being dragged: ${elmnt.id}`);
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var saveButton = elmnt.querySelector("#save-step-button");
    var isMoved = false;
    if (saveButton.style.display !== "none") {
      
      return;
    }
      // elmnt.style.position = "absolute";
      /* otherwise, move the DIV from anywhere inside the DIV:*/
      elmnt.onmousedown = dragMouseDown;
    
  
    function dragMouseDown(e) {
        console.log("dragMouseDown is moved: ", isMoved);
        isMoved = false;
  

      if (e.button === 2) {
            return;
      }

      e = e || window.event;
      e.preventDefault();
     
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;

        // document.addEventListener("mouseup", function() {
        // closeDragElement(e);
        // }, false);
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
  
    function elementDrag(e) {
      e = e || window.event;
     
      console.log("is moved in elementDrag: ", isMoved);
      isMoved = true;
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
      var textBoxIn = document.getElementById("ci-internal");
      console.log(textBoxIn.selectionStart, textBoxIn.selectionEnd);
      if (Math.abs(localToGlobal(trash).top - (localToGlobal(elmnt).top - window.scrollY)) < 50 && Math.abs(localToGlobal(trash).left - (localToGlobal(elmnt).left - window.scrollX)) < 50) {
        
        var icon = trash.querySelector(".trash-icon");
        icon.innerHTML = `<path class="trash-icon-path" d="M9 13v6c0 .552-.448 1-1 1s-1-.448-1-1v-6c0-.552.448-1 1-1s1 .448 1 1zm7-1c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm-4 0c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm4.333-8.623c-.882-.184-1.373-1.409-1.189-2.291l-5.203-1.086c-.184.883-1.123 1.81-2.004 1.625l-5.528-1.099-.409 1.958 19.591 4.099.409-1.958-5.667-1.248zm4.667 4.623v16h-18v-16h18zm-2 14v-12h-14v12h14z"/>`
        
    
      }else{
        var icon = trash.querySelector(".trash-icon");
        icon.innerHTML = `<path class="trash-icon-path" d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/>`
     
      }
  
      
      
    }
  
    function closeDragElement(e) {
       
      elmnt.style.position = "absolute";
      /* stop moving when mouse button is released:*/
      document.onmouseup = null;
      document.onmousemove = null;

      if (!isMoved) {
        return;
    }

      var trash = document.getElementById("trash");
      var textBoxEx = document.getElementById("ci-external");
      if (Math.abs(localToGlobal(trash).top - (localToGlobal(elmnt).top - window.scrollY)) < 50 && Math.abs(localToGlobal(trash).left - (localToGlobal(elmnt).left - window.scrollX)) < 50) {
        
        var icon = trash.querySelector(".trash-icon");
        icon.innerHTML = `<path class="trash-icon-path" d="M9 13v6c0 .552-.448 1-1 1s-1-.448-1-1v-6c0-.552.448-1 1-1s1 .448 1 1zm7-1c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm-4 0c-.552 0-1 .448-1 1v6c0 .552.448 1 1 1s1-.448 1-1v-6c0-.552-.448-1-1-1zm4.333-8.623c-.882-.184-1.373-1.409-1.189-2.291l-5.203-1.086c-.184.883-1.123 1.81-2.004 1.625l-5.528-1.099-.409 1.958 19.591 4.099.409-1.958-5.667-1.248zm4.667 4.623v16h-18v-16h18zm-2 14v-12h-14v12h14z"/>`
       

        var deleteContainer = document.getElementById("delete-container");
        deleteContainer.style.display = "inline-block";
        var tile = deleteContainer.querySelector(".code-steps-inner");
        var stepTile = elmnt.querySelector(".code-steps-inner");
        tile.style.backgroundColor = stepTile.style.backgroundColor;
        var title = tile.querySelector(".step-title");
        var stepTitle = elmnt.querySelector(".step-title");

        title.innerHTML = stepTitle.innerHTML;

        var deleteButton = deleteContainer.querySelector(".delete-btn");
        deleteButton.addEventListener("click", () =>{
            return executeDelete(elmnt.id);
        }, {once: true});

        // deleteButton.removeEventListener("click", function() {
        //     return executeDelete(elmnt.id);
        // }, false);

        icon.innerHTML = `<path class="trash-icon-path" d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/>`
        e.stopPropagation();
        return;
    
      }else{
        var icon = trash.querySelector(".trash-icon");
        icon.innerHTML = `<path class="trash-icon-path" d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"/>`
     
      }




      handleCodeSteps(elmnt);
      isMoved = false;
      
    }
  }
  
  

  function closeDeleteBox(){
    var deleteContainer = document.getElementById("delete-container");
    deleteContainer.style.display = "none";
  }


  function executeDelete(step){
    var num = step.replaceAll("@", "");
    var num = num.replace("Step", "");
    console.log("num is: ", num)
    var tourNum = document.getElementById("tour-step-num");
    var tourNumLength = tourNum.value
    var textBoxEx = document.getElementById("ci-external");
    console.log("tour num iks: ", tourNumLength)

     var stepObj = document.getElementById(step);
     textBoxEx.value = textBoxEx.value.substring(0, textBoxEx.value.indexOf(step)) + textBoxEx.value.slice(textBoxEx.value.indexOf(step) + step.length);
     stepObj.remove();

    console.log("here we are")

    tourNumLength = tourNumLength - 1;
    tourNum.value = tourNumLength;

    var deleteContainer = document.getElementById("delete-container");
    deleteContainer.style.display = "none";

    if (tourNumLength > 0) {
        console.log("made it here: ", Number(num) + 1)
        console.log("tour num length is: ", Number(tourNumLength))
        for (let i = Number(num) + 1; i <= Number(tourNumLength) + 1; i++){
            console.log("i guess we made it this far: ", i)
            var id = `@@@Step${i}@@@`
            var steps = document.getElementById(id);
            console.log("steps are: ", steps)
            console.log("element id is: ", id)
            var title = steps.querySelector(".code-steps-inner").querySelector(".step-title");
            title.innerHTML = `<b>Step ${i - 1}</b>`;
            textBoxEx.value = textBoxEx.value.substring(0, textBoxEx.value.indexOf(steps.id)) + `@@@Step${i-1}@@@` +  textBoxEx.value.slice(textBoxEx.value.indexOf(steps.id) + steps.id.length);
            steps.id = `@@@Step${i - 1}@@@`;
        }
    }

    vscode.postMessage({
        type: 'deleteTourStep',
        message: num
    });


  }

//   //exexcuteDelete takes in the id of the step to be deleted
//   function executeDelete(step){
//         console.log(`START OF EXECUTE DELETE`)
//         //retrieve the total number of steps from the document
//         var tourNum = document.getElementById("tour-step-num");
//         vscode.postMessage({
//             type: "hello",
//             message: `tournum: ${tourNum.value} for step: ${step}`
//         })
//         // if (parseInt(tourNum.value) < 1){
//         //     return;
//         // }

//         //retrieve the markdown text box for removing/editing the step marker
//         var textBoxEx = document.getElementById("ci-external");

//         //parse the step number from the step id
//         var num = step.replaceAll("@", "");
//         var num = num.replace("Step", "");
//         vscode.postMessage({
//             type: "hello",
//             message: `step to be deleted: ${num}`
//         })


//         //decrement the number of total steps
//         tourNum.value = parseInt(tourNum.value) - 1;

//         console.log(`tourNum ${tourNum.value}`);

//         //hide the delete pop up
//         var deleteContainer = document.getElementById("delete-container");
//         deleteContainer.style.display = "none";

//         //todo figure out why it looks like it is grabbing the object below the one to be deleted
//         //retrieve the actual object of the step from its id
//         var stepObj = document.getElementById(step);
//         console.log("step before obj: ", step);
//         console.log("step obj: ", stepObj);
//         //remove the marker from the markdown text box
//         textBoxEx.value = textBoxEx.value.substring(0, textBoxEx.value.indexOf(step)) + textBoxEx.value.slice(textBoxEx.value.indexOf(step) + step.length);
//         //remove the step object from the document
//         stepObj.remove();

//         //if there was more than 1 step present when delete was called 
//         //edit the remaining steps accordingly
//         if (tourNum.value > 0) {

//             //create an array to store the number of steps this delete operation will affect
//             var stepArr = [];
//             console.log(`start ${tourNum.value} ned ${num}`);
//             //iterate over all steps that are greater than the step that was deleted
//             //and decrement their ids and titles
//             for (var i = parseInt(tourNum.value) + 1; i > num; i--) {
//                 console.log(`step ${i}\n`);
//                 //retrieve step of the current index
//                 var steps = document.getElementById(`@@@Step${i}@@@`);
//                 console.log(steps);
//                 //retrieve the step title
//                 var title = steps.querySelector(".code-steps-inner").querySelector(".step-title");
//                 //decrement the step title 
//                 title.innerHTML = `<b>Step ${i - 1}</b>`;
//                 //push the step to the array of edited steps
//                 stepArr.push(steps);
//             }


//             //itearate over the array of edited steps and 
//             for (var i = 0; i < stepArr.length; i++) {
//                 var steps = stepArr[i];

//                 //decrement the step number
//                 var num = steps.id.replaceAll("@", "");
//                 num = num.replace("Step", "");
//                 num = parseInt(num) - 1;
                
//                 console.log(`setting step ${step.id} to  Step${num}`);

//                 //change the marker in the markdown text box to reflect the changed number of the step
//                 textBoxEx.value = textBoxEx.value.substring(0, textBoxEx.value.indexOf(steps.id)) + `@@@Step${num}@@@` +  textBoxEx.value.slice(textBoxEx.value.indexOf(steps.id) + steps.id.length);
//                 //decrement id of step
//                 step.id = `@@@Step${num}@@@`;
//                 console.log(step);

//             }
//         }

      
        

        
        
        
       



//         // vscode.postMessage({
//         //     type: "deleteTourStep",
//         //     message: ""
//         // });
//    }

   
  
  
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
  
  
  


function handleCodeSteps(elmnt){
   
    
    var textBoxIn = document.getElementById("ci-internal");
    var textBoxEx = document.getElementById("ci-external");
    const rect = textBoxEx.getBoundingClientRect();
   
    var steps = document.getElementsByClassName("code-steps");
    var trash = document.getElementById("trash");


    // vscode.postMessage({
    //     type: 'hello',
    //     message: `handling step ${i}`
    // });
    // var elmnt = steps[i];
    let word = elmnt.id;

    var elPos = elmnt.getBoundingClientRect();

    // if (doElsCollide(document.getElementById("add-pop"), elmnt)) {
    //     vscode.postMessage({
    //         type: 'hello',
    //         message: 'inside pop up'
    //     });
        
    //     if (textBoxEx.value.indexOf(word) !== -1){
            
    //         textBoxEx.value = textBoxEx.value.substring(0, textBoxEx.value.indexOf(word)) + textBoxEx.value.slice(textBoxEx.value.indexOf(word) + word.length);
            
    //         //textBoxEx.value += `\n${word}\n`;
    //     }
    //     return;
    // }


    var icon = trash.querySelector(".trash-icon");

    // vscode.postMessage({
    //     type: 'hello',
    //     message: `inner html of trash: ${icon.innerHTML}`
    // });
    
    vscode.postMessage({
        type: 'hello',
        message: `does trash collide ${localToGlobal(trash).top}  ${localToGlobal(elmnt).top - window.scrollY}`
    });
    

    // vscode.postMessage({
    //     type: 'hello',
    //     message: `does trash collide ${trash.offsetLeft} ${bounds.left}  ${trash.offsetTop} ${bounds.top}`
    // });

    // vscode.postMessage({
    //     type: 'hello',
    //     message: `does trash collide ${trash.offsetTop} ${elmnt.top} ${window.screenY} ${elmnt.offsetTop - window.scrollY}`
    // });
    
    if (doElsCollide(elmnt, trash)) {
        var icon = trash.querySelector(".trash-icon");
        vscode.postMessage({
            type: 'hello',
            message: `inner html of trash: ${icon.innerHTML}`
        });
        return;
    }else{
        vscode.postMessage({
            type: 'hello',
            message: `not in trash`
        });
    }

    if (doElsCollide(elmnt, textBoxEx)) {
        vscode.postMessage({
            type: 'hello',
            message: 'inside move'
        });

        var popUp = document.getElementById("pop-container");

        if (popUp.style.display !== "none") {
            popUp.style.display = "none";
        }

        var lineHeight = parseInt(window.getComputedStyle(textBoxEx).lineHeight)

        /////
        console.log(`line number: ${(elPos.top - rect.top) / lineHeight}`);
        var lineNumber = (elPos.top - rect.top) / lineHeight;
        var newCaretPos = textBoxEx.value.split('\n', Math.round(lineNumber)).join('\n').length;
        console.log(`newCaretPos: ${newCaretPos} for ${elmnt.id}`);
        
        // var caretPos = textBoxIn.selectionStart;

        var caretPos = newCaretPos;

        console.log(`moving step with id: ${word}`);
        
        if (textBoxEx.value.indexOf(word) !== -1){
            console.log(`replacing ${word} in handle code steps`);
            // textBoxEx.value = textBoxEx.value.substring(0, textBoxEx.value.indexOf(word)) + textBoxEx.value.slice(textBoxEx.value.indexOf(word) + word.length);
            textBoxEx.value = textBoxEx.value.replace(word, "");
            console.log("replacing word in handle: ", textBoxEx.value.replace(word, ""));
            // console.log(textBoxEx.value);
            //textBoxEx.value += `\n${word}\n`;
        }

        console.log(caretPos)


        console.log("adding word in handle: ", textBoxEx.value.substring(0, caretPos) + `\n${word}` + textBoxEx.value.slice(caretPos));
        textBoxEx.value = textBoxEx.value.substring(0, caretPos) + `\n${word}` + textBoxEx.value.slice(caretPos)


        console.log(`caret ${textBoxEx.value.substring(0, caretPos)}`)
        console.log("rest of string: ", textBoxEx.value.slice(`${word}`.length))
        console.log(textBoxEx.value);
        
        // now you have a proper float for the font size (yes, it can be a float, not just an integer)
        
                
        
        

        


        var fontSize = parseInt(window.getComputedStyle(textBoxEx).fontSize)
        var lineHeight = parseInt(window.getComputedStyle(textBoxEx).lineHeight)

        var charsBefore = 0
        const newLines = textBoxEx.value.split("\n");
        for (let i = 0; i < newLines.length; i++) {
            if (newLines[i].indexOf(word) !== -1){
                heightPos = i + 1;
            }
        } 

        for (let i = 0; i < newLines.length; i++) {
            if (newLines[i].indexOf(word)!== -1){
                break;
            }
            charsBefore += newLines[i].length + 1;
        }

        console.log(`top of textbox: ${rect.top} left of textbox: ${rect.left} height of textbox: ${rect.height} width of textbox: ${rect.width}`);

        console.log(`top of elmnt: ${elPos.top} left of elmnt: ${elPos.left} height of elmnt: ${elPos.height} width of elmnt: ${elPos.width}`);


        var startPos = (textBoxEx.value.indexOf(word));
        var endPos = (startPos + word.length) - charsBefore;

        var top = (getOffset(textBoxEx).top + (heightPos * lineHeight))
        var left = (getOffset(textBoxEx).left + (endPos * fontSize))

        if (top > rect.height || left > rect.width || left > rect.width){ 
            console.log(`step: ${word} is outside the bounds of the window`)
            elmnt.style.top = (getOffset(textBoxEx).top) + "px";
            elmnt.style.left = (getOffset(textBoxEx).left) + "px";
            handleCodeSteps(elmnt);
        }
        
        // var elmntClone = elmnt.cloneNode()
        
        
        //  elmnt.style.position = "fixed";

        elmnt.style.top = (getOffset(textBoxEx).top + (heightPos * lineHeight)+5) + "px";
        elmnt.style.left = (getOffset(textBoxEx).left + (endPos * fontSize) + 13) + "px";

        
        console.log(`moving step with id: ${word} to pos: ${top}, ${left}`);
        // elmnt.ondragstart = function () { return false; };
        
        
        

        //  elmnt.outerHTML = elmnt.outerHTML.replace(`<div id="@@@Step1@@@" draggable="true" ondragstart="dragElement(this)" class="code-steps" style="top: ${elmnt.style.top}; left: ${elmnt.style.left};">`, 
        //  `<div id="@@@Step1@@@" style="position: absolute; top: ${(getOffset(textBoxEx).top + (heightPos * lineHeight)) + "px"} left: ${(getOffset(textBoxEx).left + (7 * fontSize)) + "px"};" class="code-steps">`)
        //  elmnt.outerHTML = elmnt.outerHTML.replace(`ondragstart="dragElement(this)"`, `ondragstart="return false"`)
        
        // textBoxEx.value += `                                                        ${getOffset(textBoxEx).top}\n`
        // textBoxEx.value += `Height: ${getOffset(textBoxEx).top + (heightPos * lineHeight)}\n`
        // //  textBoxEx.value += `diffed: <div id="@@@Step1@@@" style="position: absolute; top: ${(getOffset(textBoxEx).top + (heightPos * lineHeight)) + "px"} left: ${(getOffset(textBoxEx).left + (7 * fontSize)) + "px"};" class="code-steps">\n`
        // //  textBoxEx.value += `<div id="@@@Step1@@@" draggable="true" ondragstart="dragElement(this)" class="code-steps" style="top: ${elmnt.style.top}; left: ${elmnt.style.left};">\n`
        // textBoxEx.value += `caretPos: ${caretPos} boxwidth: ${getOffset(textBoxEx).left} boxHeight: ${getOffset(textBoxEx).top} start: ${startPos} end: ${endPos} charsBefore: ${charsBefore} height: ${heightPos} fontise: ${fontSize} lineheight: ${lineHeight} totalHeight: ${elmnt.style.top} totalWidth: ${elmnt.style.left}\n`;
        

    
        // var isSelected = selectTextareaWord(textBoxEx, "Step 1");
        // e.target.appendChild(document.createTextNode(`${isSelected}`));
        textBoxIn.dispatchEvent(new KeyboardEvent('keydown', {'key':'Shift'} ));
        textBoxIn.dispatchEvent(new KeyboardEvent( 'keyup' , {'key':'Shift'} ));

    
    }else{
        if (textBoxEx.value.indexOf(word) !== -1){
            
            textBoxEx.value = textBoxEx.value.substring(0, textBoxEx.value.indexOf(word)) + textBoxEx.value.slice(textBoxEx.value.indexOf(word) + word.length);
            console.log(textBoxEx.value);
            
            //textBoxEx.value += `\n${word}\n`;
        }
    }
}





function alignCodeSteps(){
   
    console.log("INSIDE ALIGN CODE STEPS");
    var textBoxIn = document.getElementById("ci-internal");
    var textBoxEx = document.getElementById("ci-external");
    const rect = textBoxEx.getBoundingClientRect();
   
    var steps = document.getElementsByClassName("code-steps");
    var trash = document.getElementById("trash");

    for (let i = 0; i < steps.length; i++) {
      
        var elmnt = steps[i];
        if (elmnt.id === "@@@Step0@@@"){
            continue;
        }
        let word = elmnt.id;

        var elPos = elmnt.getBoundingClientRect();

       

        var icon = trash.querySelector(".trash-icon");

        
    
       
        var popUp = document.getElementById("pop-container");

        if (popUp.style.display !== "none") {
            popUp.style.display = "none";
        }

        var lineHeight = parseInt(window.getComputedStyle(textBoxEx).lineHeight)

        /////
        
        var caretPos = textBoxIn.selectionStart;
        
        if (textBoxEx.value.indexOf(word) === -1){
            console.log(caretPos)

            console.log()

            console.log("adding word in align: ", textBoxEx.value.substring(0, caretPos), "for: ", word);
            textBoxEx.value = textBoxEx.value.substring(0, caretPos) + `\n${word}` + textBoxEx.value.slice(caretPos)


            console.log(`caret ${textBoxEx.value.substring(0, caretPos)}`)
            console.log("rest of string: ", textBoxEx.value.slice(`${word}`.length))
            console.log(textBoxEx.value);
            //textBoxEx.value += `\n${word}\n`;
        }
        
        // now you have a proper float for the font size (yes, it can be a float, not just an integer)
        var fontSize = parseInt(window.getComputedStyle(textBoxEx).fontSize)
        var lineHeight = parseInt(window.getComputedStyle(textBoxEx).lineHeight)

        var charsBefore = 0
        const newLines = textBoxEx.value.split("\n");
        for (let i = 0; i < newLines.length; i++) {
            if (newLines[i].indexOf(word) !== -1){
                heightPos = i + 1;
            }
        } 

        for (let i = 0; i < newLines.length; i++) {
            if (newLines[i].indexOf(word)!== -1){
                break;
            }
            charsBefore += newLines[i].length + 1;
        }

        console.log(`postr newline calc`);
        var startPos = (textBoxEx.value.indexOf(word));
        var endPos = (startPos + word.length) - charsBefore;

        var top = (getOffset(textBoxEx).top + (heightPos * lineHeight))
        var left = (getOffset(textBoxEx).left + (endPos * fontSize))

        // if (top > rect.height || left > rect.width || left > rect.width){ 
        //     elmnt.style.top = (getOffset(textBoxEx).top) + "px";
        //     elmnt.style.left = (getOffset(textBoxEx).left) + "px";
        //     handleCodeSteps();
        // }
        
        console.log(`postr newline calc2`);
        
        //  elmnt.style.position = "fixed";

        elmnt.style.top = (getOffset(textBoxEx).top + (heightPos * lineHeight)+5) + "px";
        elmnt.style.left = (getOffset(textBoxEx).left + (endPos * fontSize) + 13) + "px";
        elmnt.style.position = "absolute";

       
          
        
       
    }
}



doElsCollide = function(el1, el2) {
    el1.offsetBottom = el1.offsetTop + el1.offsetHeight;
    el1.offsetRight = el1.offsetLeft + el1.offsetWidth;
    el2.offsetBottom = el2.offsetTop + el2.offsetHeight;
    el2.offsetRight = el2.offsetLeft + el2.offsetWidth;

    // vscode.postMessage({
    //     type: 'hello',
    //     message: `${el2.id} ${(el1.offsetBottom)} ${(el2.offsetTop)} ${(el1.offsetTop > el2.offsetBottom)} ${(el1.offsetRight)} ${(el2.offsetLeft)} ${(el1.offsetLeft > el2.offsetRight)}`
    // });
    
    return !((el1.offsetBottom < el2.offsetTop) ||
             (el1.offsetTop > el2.offsetBottom) ||
             (el1.offsetRight <= el2.offsetLeft) ||
             (el1.offsetLeft > el2.offsetRight))
};


localToGlobal = function( _el ) {
    var target = _el,
    target_width = target.offsetWidth,
    target_height = target.offsetHeight,
    target_left = target.offsetLeft,
    target_top = target.offsetTop,
    gleft = 0,
    gtop = 0,
    rect = {};

    var moonwalk = function( _parent ) {
     if (!!_parent) {
         gleft += _parent.offsetLeft;
         gtop += _parent.offsetTop;
         moonwalk( _parent.offsetParent );
     } else {
         return rect = {
         top: target.offsetTop + gtop,
         left: target.offsetLeft + gleft,
         bottom: (target.offsetTop + gtop) + target_height,
         right: (target.offsetLeft + gleft) + target_width
         };
     }
 };
     moonwalk( target.offsetParent );
     return rect;
}