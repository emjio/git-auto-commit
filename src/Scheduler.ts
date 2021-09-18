import { exec } from 'child_process';
// your extension is activated the very first time the command is executed
let timer: NodeJS.Timeout;
import * as vscode from 'vscode';
import { getNow,throwErrorType } from './utils'
import {ReminderView} from './TextView'
export default class Scheduler {
    $option: Option
    constructor(prop: Option) {
        this.$option = { ...prop }
    }
    changeOptions(option: Option) {
        this.$option = option
    }
    changeListener(e:vscode.TextDocument) {
            if (timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(() => {
                this.run()
                clearTimeout(timer)
            }, this.$option.commitTimeInterval)
    }
    private  _getDiff(path:string){
        let cmd = `cd ${path}`;
        return new Promise((resolve) => {
            cmd = cmd + ' && git diff'
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
    private _getUnCommitChange(path: string) {
        let cmd = `cd ${path}`;
        return new Promise((resolve) => {
            if (this.$option.autoPush) {
                cmd = cmd + ' && git push'
            } else {
                cmd = cmd + ' && git status'
            }
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
    run() {
        if (this.$option.path) {
                const cmd = `cd ${this.$option.path} && git add . && git commit -n -m "auto-commit" `;
                exec(cmd, (err, stdout) => {
                    if (err) {
                        const errorType = throwErrorType(err.message)
                        ReminderView.show(this.$option.context,err.message)
                    } else {
                        this._getUnCommitChange(this.$option.path as string).then(res => {
                            ReminderView.show(this.$option.context,`${getNow()} auto-commit success ${stdout} ${res}`,)
                        })
                    }
                })
            }
        }
    destroy() {
        clearTimeout(timer)
    }
}