
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    const oldState = vscode.getState() || { expiration: undefined };
    
    /** @type {Date} */
    let expiration = undefined;
    if (oldState.expiration !== undefined) {
        expiration = new Date(oldState.expiration);
    }

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'setExpirationAFK':
                expiration = new Date(message.value * 1000);

                vscode.postMessage({
                    type: "hello",
                    text: `updating state: ${expiration}`,
                });

                vscode.setState({expiration: message.value * 1000});
                break;

        }
    });

    // Update the count down every 1 second
    try {
        let x = setInterval(function() {
            try {
                // skip interval if the expiration is undefined
                if (expiration === undefined) {
                    return;
                }

                // Get today's date and time
                let now = new Date().getTime();
                    
                // Find the distance between now and the count down date
                let distance = expiration.getTime() - now;
                    
                // Time calculations for days, hours, minutes and seconds
                let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((distance % (1000 * 60)) / 1000);

                // assemble interval string
                intervalString = "";
                if (days > 0) {intervalString += days + "d ";}
                if (hours > 0) {intervalString += hours + "h ";}
                if (minutes > 0) {intervalString += minutes + "m ";}
                if (seconds > 0) {intervalString += seconds + "s ";}
                    
                // Output the result in an element with id="demo"
                document.getElementById("expiration-countdown-value").innerHTML = intervalString;
                    
                // If the count down is over, write some text 
                if (distance < 0) {
                    clearInterval(x);
                    document.getElementById("expiration-countdown-value").innerHTML = "EXPIRED";
                }
            } catch(e) {
                vscode.postMessage({
                    type: "hello",
                    text: `failed to execute interval: ${e}`,
                });
            }
            }, 500
        );
    } catch(e) {
        vscode.postMessage({
            type: "hello",
            text: `failed to set interval: ${e}`,
        });
    }

    document.querySelector('.disable-gigo-afk-button').addEventListener('click', () => {
        disableAFK();
    });

    function disableAFK() {
        vscode.postMessage({ type: 'disableAFK' });
    }
}());