// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
// this method is called when your extension is activated
import { exec } from 'child_process';
// your extension is activated the very first time the command is executed
let timer: NodeJS.Timeout;
let option = {
	commitTimeInterval: 3600000,
	autoPush: false
}
function getNow() {
	let dateTime
	let yy = new Date().getFullYear()
	let mm = new Date().getMonth() + 1
	let dd = new Date().getDate()
	let hh = new Date().getHours()
	let mf = new Date().getMinutes() < 10 ? '0' + new Date().getMinutes()
		:
		new Date().getMinutes()
	let ss = new Date().getSeconds() < 10 ? '0' + new Date().getSeconds()
		:
		new Date().getSeconds()
	dateTime = yy + '-' + mm + '-' + dd + ' ' + hh + ':' + mf + ':' + ss
	return dateTime
}
function getUnCommitChange(path: string) {
	let cmd = `cd ${path}`;
	return new Promise((resolve) => {
		if (option.autoPush) {
			cmd = cmd + ' && git push'
		} else {
			cmd = cmd + ' && git status'
		}
		console.log(cmd)
		let res = ''
		exec(cmd, (err, stdout) => {
			if (err) {
				res = err.message;
			} else {
				res = stdout
			}
			resolve(res);
		})
	})
}
function getConfig(key: string) {
	return vscode.workspace.getConfiguration().get(`code-auto-commit.${key}`);
}
async function run(path: string | undefined) {
	if (path) {
		const reg = /\/.*\//
		const res = reg.exec(path)

		if (res !== null) {
			const cmd = `cd ${res[0]} && git add . && git commit -m  "自动提交" `;
			exec(cmd, (err, stdout) => {
				if (err) {
					openStrInWindow(err.message, 'markdown')
				} else {
					getUnCommitChange(res[0]).then(res => {
						openStrInWindow(`${getNow()} 自动提交成功 \n ${stdout} \n ${res}`, 'markdown')
					})
				}
			})
		}
	}
}
export function openStrInWindow(fileContent: string, fileLanguage: string = 'markdown') {
	var option = {
		language: fileLanguage,
		content: fileContent
	}
	vscode.workspace.openTextDocument(option)
		.then(doc => {
			vscode.window.showTextDocument(doc);
		}, err => {
			console.error('Open string in window err,' + err);
		}).then(undefined, err => {
			// 捕获异常，相当于try-catch
			console.error('Open string in window err,' + err);
		});
}
function changeListener(e?: any) {
	if (e.contentChanges.length > 0) {
		if (timer) {
			clearTimeout(timer)
		}
		timer = setTimeout(() => {
			console.log('执行了')
			run(vscode.workspace.workspaceFile?.path)
			clearTimeout(timer)
		}, option.commitTimeInterval)
	}
}
export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('code-auto-commit.runCommit', () => {
		console.log(getConfig('commitTimeInterval'))
		option.commitTimeInterval = getConfig('commitTimeInterval') as number;
		option.autoPush = getConfig('autoPush') as boolean;
		// option.commitTimeInterval = getConfig('commitTimeInterval')
		vscode.workspace.onDidChangeTextDocument(changeListener)
		vscode.window.showInformationMessage('git-auto-commit成功启用');
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(() => {
		option.commitTimeInterval = getConfig('commitTimeInterval') as number;
		option.autoPush = getConfig('autoPush') as boolean;
	}));
}

// this method is called when your extension is deactivated
export function deactivate() {
	clearTimeout(timer)
}
