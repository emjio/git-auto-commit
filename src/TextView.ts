import * as vscode from 'vscode';

export class ReminderView {
    private static panel: vscode.WebviewPanel | undefined;

    public static show(context: vscode.ExtensionContext, content:string) {
        const  title="自动提交完成"
        if (this.panel) {
            this.panel.webview.html = this.generateHtml(title,content);
            this.panel.reveal();
        } else {
            this.panel = vscode.window.createWebviewPanel("git-auto-commit", "自动提交提示", vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
            this.panel.webview.html = this.generateHtml(title,content);
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }
    }

    protected static generateHtml(title: string,content: string): string {
        let contentLine = content.split('\n').map(line => `<h3 class="line">${line}</h3>`).join('')
        let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
            .code{
                margin: 0;
                padding: 0;
                overflow: auto;
                color: #000000d9;
                font-size: 13px;
                direction: ltr;
                text-align: left;
                background: #f5f5f5;
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
            <div class="code">            
            ${contentLine}
            </div>

        </body>
        </html>`;

        return html;
    }
}