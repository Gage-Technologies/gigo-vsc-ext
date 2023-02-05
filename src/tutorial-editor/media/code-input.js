// CodeInput
// by WebCoder49
// Based on a CSS-Tricks Post
const vscode = acquireVsCodeApi();

function addCodeTour(){

    try{

        var step = document.getElementById("@@@Step0@@@");
        let stepClone = step.cloneNode(true);
        stepClone.id = "@@@Step1@@@";

        

        var title = stepClone.querySelector(".code-steps-inner").querySelector(".step-title");

        title.innerHTML = `<b>Step 1</b>`;
        // stepClone.querySelector("#div.code-steps-inner > span > b")

        vscode.postMessage({
            type: 'hello',
            message: `title ${title.innerHTML}`
        });
        // title.textContent = "Step 1";

        

        var popCon = document.getElementById("pop-container");
        popCon.style.display = "inline-block";

        stepClone.style.display = "inline-block";
        step.parentElement.appendChild(stepClone);
    
    
        vscode.postMessage({
            type: 'hello',
            message: `${stepClone}`
        })
    
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


function editStep(button){

    var codeStep = button.parentElement;

    var filePath = codeStep.querySelector('#file-path');
    var lineNumber = codeStep.querySelector('#line-number');

    var filePathDiv = codeStep.querySelector('#file-path-div');
    var lineNumberDiv = codeStep.querySelector('#line-number-div');

    var saveButton = codeStep.querySelector('#save-step-button');
    saveButton.style.display = 'inline-block';

    


    vscode.postMessage({
        type: 'hello',
        message: `edit step id: ${codeStep.id}`,
    });


    filePathDiv.style.display = "inline-block";
    lineNumberDiv.style.display = "inline-block";
    button.style.display = "inline-block";
    codeStep.style.height = "30%";

    button.style.display = "none";
}

function saveStep(button) {


    var codeStep = button.parentElement;

    var filePath = codeStep.querySelector('#file-path');
    var lineNumber = codeStep.querySelector('#line-number');

    var filePathDiv = codeStep.querySelector('#file-path-div');
    var lineNumberDiv = codeStep.querySelector('#line-number-div');

    var popUp = document.getElementById('pop-container');
    


    vscode.postMessage({
        type: 'hello',
        message: `save step id: ${codeStep.id}`,
    });

    codeStep.style.position = 'absolute';
    
    vscode.postMessage({
        type: 'hello',
        message: `${filePath}`,
    });
    let mes = {
        filePath: filePath.value,
        lineNumber: lineNumber.value
    };

    filePathDiv.style.display = "none";
    lineNumberDiv.style.display = "none";
    button.style.display = "none";
    codeStep.style.height = "5%";
    popUp.style.display = "none";
    

    
    vscode.postMessage({
        type: 'saveTourStep',
        message: `${JSON.stringify(mes)}`
    });
}

//TODO IF WEIRD BEHAVIOR HAPPENS WITH MULTIPLES CHECK HERE
function expandStep(step){
    
    var editButton = step.querySelector('#edit-step-button');
    var stepButton = step.querySelector('#save-step-button');
    
    if (stepButton.style.display !== "none"){
       
     
        return;
    }

    vscode.postMessage({
        type: 'hello',
        message: `the id of the expanded step: ${step.id}`,
    });

    vscode.postMessage({
        type: 'hello',
        message: `${step.style.height.value}`,
    });
 

    if (editButton.style.display === "none"){
        step.style.height = "10%";
        editButton.style.display = "inline-block";
        
        return;
    }

    var editButton = document.getElementById('edit-step-button');
    step.style.height = "5%";
    editButton.style.display = "none";
  
   
   
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

            // Update code
            result_element.innerHTML = this.escape_html(text);
            this.plugin_evt("beforeHighlight");

            // Syntax Highlight
            if(this.template.includeCodeInputInHighlightFunc) this.template.highlight(result_element, this);
            else this.template.highlight(result_element);
           
            this.plugin_evt("afterHighlight");


            
            

            vscode.postMessage({
                type: 'updateFile',
                message: `${text}`
            })

            

            
        }

        sync_scroll() {
            /* Scroll result to scroll coords of event - sync with textarea */
            let input_element = this.querySelector("textarea");
            let result_element = this.template.preElementStyled ? this.querySelector("pre") : this.querySelector("pre code");
            // Get and set x and y
            result_element.scrollTop = input_element.scrollTop;
            result_element.scrollLeft = input_element.scrollLeft;

            try{
                handleCodeSteps();
            }catch(e){
                vscode.postMessage({
                    type: 'hello',
                    message: `${e}`
                });
            }
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
    
            textarea.setAttribute("onkeydown", "handleCodeSteps();");
            textarea.setAttribute("onsubmit", "handleCodeSteps();");
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


function handleCodeSteps(){
   
    
    var textBoxIn = document.getElementById("ci-internal");
    var textBoxEx = document.getElementById("ci-external");
    const rect = textBoxEx.getBoundingClientRect();
    var steps = document.getElementsByClassName("code-steps");

    for (let i = 0; i < steps.length; i++) {
        var elmnt = steps[i];
        let word = elmnt.id;

        if (doElsCollide(document.getElementById("add-pop"), elmnt)) {
            
            if (textBoxEx.value.indexOf(word) !== -1){
                
                textBoxEx.value = textBoxEx.value.substring(0, textBoxEx.value.indexOf(word)) + textBoxEx.value.slice(textBoxEx.value.indexOf(word) + word.length);
                
                //textBoxEx.value += `\n${word}\n`;
            }
            return;
        }
        
        
    
        if (doElsCollide(elmnt, textBoxEx)) {
            vscode.postMessage({
                type: 'hello',
                message: 'inside move'
            });
            
            var caretPos = textBoxIn.selectionStart;
            
            if (textBoxEx.value.indexOf(word) === -1){
                textBoxEx.value = textBoxEx.value.substring(0, caretPos) + `\n${word}\n` + textBoxEx.value.slice(`\n${word}\n`.length)
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


            var startPos = (textBoxEx.value.indexOf(word));
            var endPos = (startPos + word.length) - charsBefore;

            var top = (getOffset(textBoxEx).top + (heightPos * lineHeight))
            var left = (getOffset(textBoxEx).left + (endPos * fontSize))
    
            if (top > rect.height || left > rect.width || left > rect.width){ 
                elmnt.style.top = (getOffset(textBoxEx).top) + "px";
                elmnt.style.left = (getOffset(textBoxEx).left) + "px";
                handleCodeSteps();
            }
            
            var elmntClone = elmnt.cloneNode()
            
            
            //  elmnt.style.position = "fixed";

            elmnt.style.top = (getOffset(textBoxEx).top + (heightPos * lineHeight)) + "px";
            elmnt.style.left = (getOffset(textBoxEx).left + (endPos * fontSize - 40)) + "px";
            elmnt.ondragstart = function () { return false; };
           
            
            

            //  elmnt.outerHTML = elmnt.outerHTML.replace(`<div id="@@@Step1@@@" draggable="true" ondragstart="dragElement(this)" class="code-steps" style="top: ${elmnt.style.top}; left: ${elmnt.style.left};">`, 
            //  `<div id="@@@Step1@@@" style="position: absolute; top: ${(getOffset(textBoxEx).top + (heightPos * lineHeight)) + "px"} left: ${(getOffset(textBoxEx).left + (7 * fontSize)) + "px"};" class="code-steps">`)
            //  elmnt.outerHTML = elmnt.outerHTML.replace(`ondragstart="dragElement(this)"`, `ondragstart="return false"`)
            
            textBoxEx.value += `                                                        ${getOffset(textBoxEx).top}\n`
            textBoxEx.value += `Height: ${getOffset(textBoxEx).top + (heightPos * lineHeight)}\n`
            //  textBoxEx.value += `diffed: <div id="@@@Step1@@@" style="position: absolute; top: ${(getOffset(textBoxEx).top + (heightPos * lineHeight)) + "px"} left: ${(getOffset(textBoxEx).left + (7 * fontSize)) + "px"};" class="code-steps">\n`
            //  textBoxEx.value += `<div id="@@@Step1@@@" draggable="true" ondragstart="dragElement(this)" class="code-steps" style="top: ${elmnt.style.top}; left: ${elmnt.style.left};">\n`
            textBoxEx.value += `caretPos: ${caretPos} boxwidth: ${getOffset(textBoxEx).left} boxHeight: ${getOffset(textBoxEx).top} start: ${startPos} end: ${endPos} charsBefore: ${charsBefore} height: ${heightPos} fontise: ${fontSize} lineheight: ${lineHeight} totalHeight: ${elmnt.style.top} totalWidth: ${elmnt.style.left}\n`;
            

        
            // var isSelected = selectTextareaWord(textBoxEx, "Step 1");
            // e.target.appendChild(document.createTextNode(`${isSelected}`));
        
        }else{
            if (textBoxEx.value.indexOf(word) !== -1){
                
                textBoxEx.value = textBoxEx.value.substring(0, textBoxEx.value.indexOf(word)) + textBoxEx.value.slice(textBoxEx.value.indexOf(word) + word.length);
                
                //textBoxEx.value += `\n${word}\n`;
            }
        }
    }
}