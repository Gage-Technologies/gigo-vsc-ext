"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activateFireAnimation = void 0;
const vscode = require("vscode");
function activateFireAnimation(context) {
    // Create a new WebView panel
    //   const panel = vscode.window.createWebviewPanel(
    //     'customEditorOverlay',
    //     'Custom Editor Overlay',
    //     vscode.ViewColumn.One,
    //     {
    //       enableScripts: true,
    //     }
    //   );
    // Create a new WebView panel
    const panel = vscode.window.createWebviewPanel('customPopup', 'Animated Popup', vscode.ViewColumn.Beside, {
        enableScripts: true,
    });
    // Load HTML content
    panel.webview.html = getWebviewContent(panel.webview, vscode.Uri.file("/home/user/Development/Projects/gigo-vsc-ext/src/streak/SCJ6Uv4ExK.gif"), vscode.Uri.file("/home/user/Development/Projects/gigo-vsc-ext/src/streak/ClaXgyIXJR.gif"));
    // Show the WebView panel
    panel.reveal(vscode.ViewColumn.Active);
}
exports.activateFireAnimation = activateFireAnimation;
function getWebviewContent(webview, animationFilePath, fireworkPath) {
    // Return the HTML content for the WebView panel
    return `
    <html>
      <head>
      <meta charset="UTF-8">
      <!--
        Use a content security policy to only allow loading styles from our extension directory,
        and only allow scripts that have a specific nonce.
        (See the 'webview-sample' extension sample for img-src content security policy examples)
      -->

              <meta http-equiv="Content-Security-Policy" default-src * 'unsafe-inline' 'unsafe-eval'; script-src ${webview.cspSource} img-src * data: blob: 'unsafe-inline'; frame-src *; style-src * 'unsafe-inline';>
      
        <style>
          /* Add CSS styles for positioning the overlay */
          /* Example: position: fixed; top: 0; left: 0; */
          body {
            position: relative;
            height: 100vh;
          }
          .animation-container {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            text-align: center;
          }
          .animation-image {
            max-width: 100%;
            max-height: 100%;
          }
          
          .streak-title {
            position: absolute;
            top: 10%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(255, 29, 17, 1);
          }

          .streak-number {
            position: absolute;
            display: flex;
            justify-content: center;
            align-items: center;
            top: 50%;
            left: 50%;
            font-size: 48px;
            font-weight: bold;
            color: white;
            text-shadow: 2px 2px 4px rgba(255, 29, 17, 1);
          }
        
          .rolling-digit {
            top: 50%;
            animation: roll 1s;
          }
        
          @keyframes roll {
            0% {
              transform: translateY(0%);
            }
            20% {
              transform: translateY(30%);
            }
            40% {
              transform: translateY(35%);
            }
            60% {
              transform: translateY(40%);
            }
            80% {
              transform: translateY(45%);
            }
            100% {
              transform: translateY(50%);
            }
          }
          
        </style>

  
      </head>
      <body onload="load()">
        <div class="streak-title">
          Streak Extended
        </div>
        <div id="rolling-num" class="streak-number">
        
          <p id="num">0</p>

         
        </div>
    
        <!-- Add the animation content here -->
        <div class="animation-container">
          <img id="fireworks" class="animation-image" src="${webview.asWebviewUri(fireworkPath)}" style="display:none;" alt="Animation">
          <img class="animation-image" src="${webview.asWebviewUri(animationFilePath)}" alt="Animation">
          
        </div>
        <script type="text/javascript">
        function animate(obj, initVal, lastVal, duration) {
          let startTime = null;

          //get the current timestamp and assign it to the currentTime variable
          let currentTime = Date.now();

          //pass the current timestamp to the step function
          const step = (currentTime ) => {

            //if the start time is null, assign the current time to startTime
            if (!startTime) {
                startTime = currentTime ;
            }

            //calculate the value to be used in calculating the number to be displayed
            const progress = Math.min((currentTime - startTime)/ duration, 1);

            //calculate what to be displayed using the value gotten above
            obj.innerHTML = Math.floor(progress * (lastVal - initVal) + initVal);

            //checking to make sure the counter does not exceed the last value (lastVal)
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                  window.cancelAnimationFrame(window.requestAnimationFrame(step));
                  const firework = document.getElementById('fireworks');
                  firework.style.display = "block";
                }
          };
          //start animating
          window.requestAnimationFrame(step);
        }
        let text1 = document.getElementById('num');
        const load = () => {
           
            animate(text1, 0, 511, 700);
            
        }
        
        </script>
      </body>
      
    </html>
  `;
}
//# sourceMappingURL=eplosion_webview.js.map