// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// this method is called when your extension is activated
import Scheduler from './Scheduler'
import { checkPathSafe, getConfig } from './utils'
let instance:Scheduler

export async function activate(context: vscode.ExtensionContext) {
	let config:Option = {
		commitTimeInterval:getConfig<number>('commitTimeInterval')|| 0,
		autoPush:getConfig<boolean>('autoPush') || false,
		context
	}
	let checkPathRes = await checkPathSafe(vscode.workspace.workspaceFolders)
	if(checkPathRes){
		vscode.window.showErrorMessage(checkPathRes);
		return
	}else{
		config.path = vscode.workspace.workspaceFolders?.[0].uri.fsPath
		instance = new Scheduler({...config,context})
		vscode.window.showInformationMessage('git-auto-commit成功启用');
		vscode.workspace.onDidSaveTextDocument((e)=> instance.changeListener(e))
	}
	let disposable = vscode.commands.registerCommand('code-auto-commit.runCommit', () => {
		
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
		config.commitTimeInterval = getConfig<number>('commitTimeInterval') ||0;
		config.autoPush = getConfig<boolean>('autoPush') || false;
		instance.changeOptions(config)
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
	instance.destroy()
}
