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
        let contentLine = content.split('\n').map(line => `<div><h3>${line}</h3></div>`)
        let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>杨超越</title>
        </head>
        <body>
            <div><h1>${title}</h1></div>
            ${contentLine}
        </body>
        </html>`;

        return html;
    }
}