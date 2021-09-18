import path = require('path');
import * as vscode from 'vscode';
const fs = require('fs');
import { exec } from 'child_process';
import { rejects } from 'assert';
export function getNow() {
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
export function getConfig<T = any>(key: string) {
	return vscode.workspace.getConfiguration().get<T>(`code-auto-commit.${key}`);
}

const errorType: {
	[propName: string]: string;
}
	= {
	notRepository: "fatal: not a git repository (or any of the parent directories): .git",
}

export const checkIsRepository = async (path: string) => {
	const cmd = `cd ${path} && git worktree list`
	let res: boolean;
	try {
		await runCommand(cmd)
		res = true
	} catch (e) {
		res = false
	}
	return res
}

export const throwErrorType = function (errMsg: string) {
	for (let key in errorType) {
		if (errMsg.includes(errorType[key])) {
			return key
		}
	}
	return errMsg
}
export const checkPathSafe = async (path?: readonly vscode.WorkspaceFolder[]) => {
	if (!path) {
		return '不是合法目录'
	}
	let isRepository = await checkIsRepository(path[0].uri.fsPath)
	if (!isRepository) {
		return '不是一个git管理项目'
	}
	return null
}
export const runCommand = (cmd: string) => {
	return new Promise<string>((resolve, reject) => {
		exec(cmd, (err, stdout) => {
			if (err) {
				console.log(err)
				reject(err.message);
			} else {
				resolve(stdout)
			}
		})
	})
}
/**
 * 从某个HTML文件读取能被Webview加载的HTML内容
 * @param {string} context 上下文
 * @param {string} templatePath 相对于插件根目录的html文件相对路径
 */
function getWebViewContent(context: vscode.ExtensionContext, templatePath: string) {
	const resourcePath = path.join(context.extensionPath, templatePath);
	const dirPath = path.dirname(resourcePath);
	let html: string = fs.readFileSync(resourcePath, 'utf-8');
	// vscode不支持直接加载本地资源，需要替换成其专有路径格式，这里只是简单的将样式和JS的路径替换
	html = html.replace(/(<link.+?href="|<script.+?src="|<img.+?src=")(.+?)"/g, (m: string, $1: string, $2: string) => {
		return $1 + vscode.Uri.file(path.resolve(dirPath, $2)).with({ scheme: 'vscode-resource' }).toString() + '"';
	});
	return html;
}