'use strict';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

import simpleGit, { SimpleGit } from 'simple-git';
import exp = require('constants');

let myStatusBarItem: vscode.StatusBarItem;

//auto git dynamically commits and pushes to git
class AutoGit implements vscode.Disposable { 
    public counter: number = 0;
    private intervalId: any = null;
    public workspace!: vscode.Uri;
    public running: boolean = false;
    private homedir!: string;
    private logsdir!: string;
    public cfg!: string;
    private gitdir!: string;
    private gitcfg!: string;
	public isInitialized: boolean = false;

    //class constructor 
    constructor(){
        //attempt to find the home directory of workspace
		this.checkWorkspace();

        //ensure that current workspace is a git repository
		this.checkGit();

		try {
            //ensure that config exists
            fs.statSync(this.cfg);
			this.isInitialized = true;

            //read user git config
            var userCfg: any = JSON.parse(fs.readFileSync(this.cfg, 'utf8'));
            var currentCfg: any = this.currentConfigSchema();
            //validate that all parameters are present in current config
            if(!this.compareKeys(userCfg, currentCfg)){
                const newProperties = Object.keys(currentCfg).filter(prop => !userCfg.hasOwnProperty(prop));

                newProperties.forEach(prop => {
                    userCfg[prop] = currentCfg[prop];
                });
                
                fs.writeFileSync(this.cfg, JSON.stringify(userCfg, null, 2));
            }
        } catch (err) {
            console.log(err);
        }
	}

    //actiavet() is called on startup
    public activate(context: vscode.ExtensionContext): void {
        //register necessary commands
        let cmdversion = vscode.commands.registerCommand('autogit.version', () => {
            vscode.window.showInformationMessage('Version 1.1.4 by Eray Sönmez <dev@ray-works.de>');
        });
    
        let cmdinit = vscode.commands.registerCommand('autogit.init', () => {
            if(this.checkWorkspace() && this.checkGit()){
                if(!this.isInitialized){
                    this.setup();
                    this.start();
                    vscode.window.showInformationMessage('Auto-Git initialized.');
                } else {
                    vscode.window.showInformationMessage('Auto-Git is already initialized.');
                }
            } else {
                vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
            }
        });
        
        //ensure that workspace and git repo are both valid on start
        let cmdstart = vscode.commands.registerCommand('autogit.start', () => {
            if(this.checkWorkspace() && this.checkGit()){
                //ensure that git is initialized
                if(this.isInitialized){
                    //if extension is not currently active start it
                    if(!this.running){
                        this.start();
                        vscode.window.showInformationMessage('Auto-Git started.');
                    } else {       
                        vscode.window.showInformationMessage('Auto-Git is already running.');
                    }
                } else {
                    vscode.window.showInformationMessage('Run `Auto-Git: Init` before `Auto-Git: Start`.');
                }
            } else {
                vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
            }
        });
    
        let cmdstop = vscode.commands.registerCommand('autogit.stop', () => {
            if(this.checkWorkspace() && this.checkGit()){
                if(this.running){
                    this.stop();
                    vscode.window.showInformationMessage('Auto-Git stopped.');
                } else {
                    vscode.window.showInformationMessage('Auto-Git is not running.');
                }
            } else {
                vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
            }
        });
    
        let cmdrestart = vscode.commands.registerCommand('autogit.restart', () => {
            if(this.checkWorkspace() && this.checkGit()){
                if(this.running){
                    this.stop();
                    this.start();
                    vscode.window.showInformationMessage('Auto-Git restarted.');
                } else {
                     if(this.isInitialized){
                        this.start();
                        vscode.window.showInformationMessage('Auto-Git restarted.');
                     } else {
                         vscode.window.showInformationMessage('Run `Auto-Git: Init` before `Auto-Git: Restart`.');
                     }
                }
            } else {
                vscode.window.showInformationMessage('Auto-Git can only run in a workspace and git-repository.');
            }
        });
    
        context.subscriptions.push(cmdinit);
        context.subscriptions.push(cmdversion);
        context.subscriptions.push(cmdstart);
        context.subscriptions.push(cmdstop);
        context.subscriptions.push(cmdrestart);
    
        if(this.isInitialized){
            var cfg = JSON.parse(fs.readFileSync(this.cfg, 'utf8'));
            if(cfg.runOnStart){
                this.start();
            }
        }
    
        //create status bar icon for displaying time until next auto save
        myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
        context.subscriptions.push(myStatusBarItem);
        myStatusBarItem.show();
    }

    dispose(): void {
        this.stop();
    }

    //basic config is configured to auto update every 5 secs
    public currentConfigSchema(): object {
        return { 
            "runOnStart": true,
            'updateInterval': 5,
            'logging': true, 
            'silent': false,
            "commitMessage": "--- Auto Git Commit ---",
            "locale": "en-US",
            "timeZone": "Europe/Berlin"
        };
    }

    private compareKeys(a: object, b: object): boolean {
        var aKeys = Object.keys(a).sort();
        var bKeys = Object.keys(b).sort();
        return JSON.stringify(aKeys) === JSON.stringify(bKeys);
    }

    //update status bar with passed in text
    private updateStatusBarItem(text: string): void {
        myStatusBarItem.text = text;
    }

    //start() functions as main loop for auto-git extension
    public start(): void {
        //loads auto-git config into json object
        var cfg = JSON.parse(fs.readFileSync(this.cfg, 'utf8'));

        //setting up local variables for auto-update intervals
        this.running = true;
        this.counter = cfg.updateInterval;

        //begin interval interation and retrieve intervalid for loop control
        this.intervalId = setInterval(() => {
            //decrement counter
            this.counter--;
            try {
                //display time until next commit
                this.updateStatusBarItem("Next Auto-Git in... " + this.counter);
            } catch (e) {
                console.log("failed to update status bar: ", e);
            }
            //when counter reaches zero execute auto-git extension
            if(this.counter === 0){
                this.updateStatusBarItem("Auto-Git: Checking files...");
                //reset counter from config parameter
                this.counter = cfg.updateInterval;
                //load repository from workspace file
                const git: SimpleGit = simpleGit(this.workspace.fsPath);

                //pull repository
                git.pull();
                //append to tree
                git.add('.'+ path.sep + '*');

                //check if repository is dirty and compile changes
                git.status().then(async (status: any) => { 
                    //deyermine number of changes from status modified, created, deleted, and renamed files
                    let changes = status.modified.length + status.created.length + status.deleted.length + status.renamed.length;
                    if(changes > 0){
                        //update status bar
                        this.updateStatusBarItem("Auto-Git: Pushing files...");

                        //time formatting options
                        let options = { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            timeZone: cfg.timeZone ?? 'Europe/Berlin',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        } as const;    

                        var replacements: { [key: string]: string }  = {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            "{ts}": (new Date().getTime() / 1000).toString(),
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            "{ts.utc}": new Date().toUTCString(),
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            "{ts.iso}": new Date().toISOString(),
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            "{ts.locale}": new Date().toLocaleString(cfg.locale ?? 'en-US', { timeZone: cfg.timeZone ?? 'Europe/Berlin' }),
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            "{ts.locale.date}": new Date().toLocaleDateString(cfg.locale ?? 'en-US', { timeZone: cfg.timeZone ?? 'Europe/Berlin' }),
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            "{ts.locale.time}": new Date().toLocaleTimeString(cfg.locale ?? 'en-US', { timeZone: cfg.timeZone ?? 'Europe/Berlin' }),
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            "{ts.locale.long}": new Date().toLocaleString(cfg.locale ?? 'en-US', options)
                        };

                        //format config message
                        cfg.commitMessage = cfg.commitMessage.replace(/\{.+?\}/g, (key: string): string => replacements[key]);

                        //await commit message
                        await git.commit(cfg.commitMessage ?? "--- Auto-Git Commit ---");
						var remote = status.tracking.split('/')[0] ?? "origin";
						var branch = status.tracking.split('/')[1] ?? "master";

                        //push commit to origin/master
                        await git.push(remote, branch, ['-u']);

                        //log to file
                        console.log("[Auto-Git]: Changes since last sync: modified (" + status.modified.length + ") | created (" + status.created.length + ") | deleted (" + status.deleted.length + ") | renamed: (" + status.renamed.length + ")" );
                        if(cfg.logging){
                            var date = new Date();
                            let log = "-------------------- Auto-Git Log --------------------";
                            log += "\n" + date.toString();
                            log += "\n------------------------------------------------------";

                            log += "\n";
                            log += "\nModified files:";
                            log += "\n";
                            status.modified.forEach((element: string) => {
                                log += "* " + element + "\n";
                            });

                            log += "\n";
                            log += "\nCreated files:";
                            log += "\n";
                            status.created.forEach((element: string) => {
                                log += "* " + element + "\n";
                            });

                            log += "\n";
                            log += "\nDeleted files:";
                            log += "\n";
                            status.deleted.forEach((element: string) => {
                                log += "* " + element + "\n";
                            });

                            log += "\n";
                            log += "\nRenamed files:";
                            log += "\n";
                            status.renamed.forEach((element: string) => {
                                log += "* " + element + "\n";
                            });

                            fs.writeFileSync(this.logsdir + path.sep + 'log-' + date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear() + '-' + date.getHours() + '-' + date.getMinutes() + '-' + date.getSeconds() + '.txt', log);
                        }
                        if(!cfg.silent){
                            //if not silent display update message with number of modified files
                            vscode.window.showInformationMessage("Auto-Git updated " + changes + " change(s)."); 
                        }

                        //update status bar
                        this.updateStatusBarItem("Auto-Git: Push done. Starting next cycle...");
                    }
                });

                //reset interval for next interation
                clearInterval(this.intervalId);
                this.intervalId = null;
                //recursively call this function again after 5s
                setTimeout(() => {
                    this.start();
                }, 5000);
            }
        }, 1000);
    }

    //stop() pauses all actions and updates status bar
    public stop(): void {
        if(this.running){
            //stop interval iteration
            clearInterval(this.intervalId);
            //reset interval value for restart
            this.intervalId = null;
            this.running = false;
            this.updateStatusBarItem("--- Auto-Git not running ---");
        }
    }

    public setup() {
        try{
            fs.statSync(this.homedir);
        } catch (err) {
            fs.mkdirSync(this.homedir);
        }

        try{
            fs.statSync(this.logsdir);
        } catch (err) {
            fs.mkdirSync(this.logsdir);
        }

        try {
            fs.statSync(this.cfg);
        } catch (err) {
            fs.writeFileSync(this.cfg, JSON.stringify(this.currentConfigSchema(), null, 2));
        }

        try{
            fs.statSync(this.workspace.fsPath.concat(path.sep + '.gitignore'));
        }catch(err){
            fs.writeFileSync(this.workspace.fsPath.concat(path.sep + '.gitignore'), '.autogit');
        }

        let gitignore = fs.readFileSync(this.workspace.fsPath.concat(path.sep + '.gitignore'));
        if(gitignore.indexOf('.autogit') === -1) {
            fs.appendFileSync(this.workspace.fsPath.concat('.gitignore'), '.autogit');
        }

		this.isInitialized = true;
    }

    //checkGit() validates that the current workspace is a git repo
    public checkGit(): boolean {
        try {
            fs.statSync(this.gitdir);
            fs.statSync(this.gitcfg);
            console.log('[Auto-Git] [OK]: Workspace is a git repository.');
            return true;
        }
        catch (err) {
            console.log('[Auto-Git] [Error]: Workspace is not a git repository, disabling extension.');
            return false;
        }
    }

    //checkWorkspace() validates that the current working directory is a workspace and that proper git files are present
    public checkWorkspace(): boolean {
        try {
			if(vscode.workspace.workspaceFolders !== undefined){
				fs.statSync(vscode.workspace.workspaceFolders[0].uri.fsPath );
				console.log('[Auto-Git] [OK]: Workspace found: ' + vscode.workspace.workspaceFolders[0].uri.fsPath);
				this.workspace = vscode.workspace.workspaceFolders[0].uri;
				
				this.homedir = this.workspace.fsPath.concat(path.sep + '.autogit');
				this.logsdir = this.workspace.fsPath.concat(path.sep + '.autogit/logs');
				this.cfg = this.workspace.fsPath.concat(path.sep + '.autogit/autogit.json');
				this.gitdir = this.workspace.fsPath.concat(path.sep + '.git');
				this.gitcfg = this.workspace.fsPath.concat(path.sep + '.git/config');

				return true;
			} else {
				console.log('[Auto-Git] [Error]: No workspace found, disabling extension.');
			}
        }
        catch (err) {
            console.log('[Auto-Git] [Error]: No workspace found, disabling extension.');
		}
		return false;
    }
}

export default AutoGit;