// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// this method is called when your extension is activated
import Scheduler from './Scheduler'
import { getConfig } from './utils'
let instance:Scheduler

export function activate(context: vscode.ExtensionContext) {
	let config:Option = {
		path:vscode.workspace.workspaceFile?.path,
		commitTimeInterval:getConfig('commitTimeInterval') as number,
		autoPush:getConfig('autoPush') as boolean,
		context
	}
	vscode.window.showInformationMessage('git-auto-commit成功启用');
	if(!vscode.workspace.workspaceFile){
		vscode.window.showErrorMessage('当前目录下不存在工作区,无法获取执行目录。请先将本项目保存为工作区');
	}else{
		instance = new Scheduler({...config,context});
		vscode.workspace.onDidSaveTextDocument((e)=>{instance.changeListener(e)})

	}
	let disposable = vscode.commands.registerCommand('code-auto-commit.runCommit', () => {
		
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
		config.commitTimeInterval = getConfig('commitTimeInterval') as number;
		config.autoPush = getConfig('autoPush') as boolean;
		instance.changeOptions(config)
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
	instance.destroy()
}
