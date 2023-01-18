
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    const vscode = acquireVsCodeApi();

    // updateColorList(colors);

    document.querySelector('.enable-gigo-afk-button').addEventListener('click', () => {
        enableAFK();
    });

    function enableAFK() {
        vscode.postMessage({
            command: "hello",
            text: "enable afk js called",
          });
        vscode.postMessage({ type: 'enableAFK' });
    }
}());