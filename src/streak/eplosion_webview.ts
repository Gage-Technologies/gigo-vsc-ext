import * as vscode from 'vscode';

export async function activateFireAnimation(context: vscode.ExtensionContext, streakNUm: number) {
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
  const panel = vscode.window.createWebviewPanel(
    'customPopup',
    'Animated Popup',
    vscode.ViewColumn.Beside,
    {
      enableScripts: true,
    }
  );

  // Load HTML content
  panel.webview.html = getWebviewContent(panel.webview, "https://api.gigo.dev/static/ext/SCJ6Uv4ExK.gif", "https://api.gigo.dev/static/ext/ClaXgyIXJR.gif", streakNUm);

  // Show the WebView panel
  panel.reveal(vscode.ViewColumn.Active);

  await new Promise(resolve => setTimeout(resolve, 6000));
  panel.dispose();

}

function getWebviewContent(webview: vscode.Webview, animationFilePath: string, fireworkPath: string, streakNum: number) {


 

  const background = "https://api.gigo.dev/static/ext/background-logo.svg";

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
            width: 100vw;
          }
          .animation-container {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            text-align: center;
          }
          .animation-image {
            width: 500%;
            max-height: 100%;
          }
          .animation-image-num {
            position: absolute;
            z-index: 1;
            top: 15%;
            left: 15%;
          }
          
          .streak-title {
            position: absolute;
            top: 5%;
            left: 50%;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            font-size: 10vw;
            font-weight: bold;
            color: #ff7a0e;
            text-shadow: 2px 2px 4px rgba(255, 29, 17, 1);
           
          }

          .streak-number {
            position: absolute;
            top: 48%;
            left: 50%;
            white-space: nowrap;
            transform: translate(-50%, -50%);
            font-size: 10vw;
            font-weight: bold;
            color: #ff7a0e;
            text-shadow: 2px 2px 4px rgba(255, 29, 17, 1);
            z-index: 2;
        
          }

          .background {
            text-align: center;
            position: absolute;
            bottom: 0;
            left: 30;
            width: 100%;
            height: 100%;
            background-image: url("${background}");
            background-repeat: no-repeat;
            background-size: 100% 100%;
            opacity: 100%;
          }
        
          
      
          
        </style>
        <script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script> 
  
      </head>
      <body onload="load()">
        <div class="background"></div>
        <div class="streak-title">
          Streak Extended
        </div>
        <div id="rolling-num" class="streak-number">
        
          <p id="num">0</p>
          


   
         
        </div>
        <div class="animation-image-num">
          <lottie-player src="https://lottie.host/7820b38d-2747-4a17-9285-d7972c5634e8/lr8YOV3XKS.json" background="transparent" speed=".65" style="width: 600px; height: 600px;" autoplay></lottie-player>
        </div>
        <!-- Add the animation content here -->
        <div>
          
        </div>
        <div class="animation-container">
          <img id="fireworks" class="animation-image" src="${fireworkPath}" style="display:none;" alt="Animation">
          <img class="animation-image" src="${animationFilePath}" alt="Animation">
          
          
        </div>
        <script type="text/javascript">
        function wait(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
        }
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

                  const animNum = document.getElementById('animNum');
                  animNum.style.display = "block";
                  
                }
          };
          //start animating
          window.requestAnimationFrame(step);
        }
        let text1 = document.getElementById('num');
        const load = () => {
           
          animate(text1, ${streakNum - 1}, ${streakNum}, 1000);
          
            
        }
        
        
        </script>
      </body>
      
    </html>
  `;
}