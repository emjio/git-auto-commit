import * as vscode from 'vscode';

export class ReminderView {
    private static panel: vscode.WebviewPanel | undefined;

    public static show(context: vscode.ExtensionContext, content: string | textViewOption) {
        const title = "自动提交完成"
        if (this.panel) {
            this.panel.webview.html = this.generateHtml(title, content);
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel("git-auto-commit", "自动提交提示", vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            this.panel.webview.html = this.generateHtml(title, content);
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }
    }
    protected static generateHtml(title: string, content: string | textViewOption) {
        let contentLine: string = '';
        let diffLine: string = '';
        let gitStatusLine: string = '';
        if (typeof content === 'string') {
            contentLine = content.split('\n').map(line => `<h3 class="line">${line}</h3>`).join('')
        } else {
            contentLine = content.commitRes.split('\n').map(line => `<h3 class="line">${line}</h3>`).join('')
            diffLine = content.diffRes.split('\n').map(line => `<h3 class="line">${line}</h3>`).join('')
            gitStatusLine = content.gitStatus.split('\n').map(line => `<h3 class="line">${line}</h3>`).join('')
        }
        let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
            .block{
                padding:20px;
                border-radius:15px;
                display: block;
                overflow-x: auto;
                padding: 0.5em;
                color: #abb2bf;
                background: #282c34;
                margin:20px 0;
            }
            .block .title{
                font-family: 微软雅黑;
                font-size: 26px;
                font-weight: 400;
                line-height: 32px;
            }
            .code{
                margin: 0;
                padding: 0;
                overflow: auto;
                color: #000000d9;
                font-size: 13px;
                direction: ltr;
                text-align: left;
                border: none;
            }
            .code h3{
                color: #999;
            }
            </style>
            <title>杨超越</title>
        </head>
        <body>
            <div><h1>${title}</h1></div>
            <div class="block">
            <div class="title">提交内容</div>            
            <div class="code">${contentLine}</div>
            </div>
            <div class="block">
            <div class="title">提交代码差异</div>            
            <div class="code">${diffLine}</div>
            </div>
            <div class="block">
            <div class="title">与远程分支差异</div>            
            <div class="code>${gitStatusLine}</div>
            </div>
        </body>
        </html>`;
        return html;
    }
}