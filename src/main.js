// file: webview-ui/main.js

//import {Uri} from "vscode";

import * as vscode from 'vscode';

// const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  console.log("executiong main function");

  const next = document.getElementById("nextTuitorial");
  next.addEventListener("click", nextMarkdown);
  

}

function handleHowdyClick() {
  console.log("executing button click");
  // const uri = vscode.Uri.file("README.md");
  // commands.executeCommand("markdown.showPreview", uri);
  vscode.postMessage({
    command: "hello",
    text: "Hey there partner! 🤠",
  });

 
}

function nextMarkdown() {

  const fs = require('fs');
  const markdown = require('markdown-it');
  const shiki = require('shiki');
  //const t = shiki.loadTheme(join(process.cwd(), 'vscode.theme-kimbie-dark'));

  shiki.getHighlighter({
    theme: 'github-dark'
    }).then((highlighter) => {
      const md = markdown({
          html: true,
          highlight: (code, lang) => {
          return highlighter.codeToHtml(code, { lang });
          }
      });

      const html = md.render(fs.readFileSync("/home/user/Development/Fun/hopeThisWorks/tuitorial-2.md", 'utf-8'));
      const out = `
          <title>Shiki</title>
          <link rel="stylesheet" href="style.css">
          ${html}
          <script src="index.js"></script>
      `;
      currentPanel.webview.html = out;

      console.log('done');
    },
  );



  console.log("here");
  try {
    vscode.postMessage({
      command: "nextTuitorial",
      text: `VSCode\n${vscode.command}`,
    });
  } catch (e) {
    vscode.postMessage({
      command: "hello",
      text: `Failed to update markdown\n${e}`,
    });
  }

  vscode.postMessage({
    command: "hello",
    text: "Updating Markdown File",
  });

  //commands.executeCommand("markdown.showPreviewToSide", uri);
}