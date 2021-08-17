import { exec } from 'child_process';
// your extension is activated the very first time the command is executed
let timer: NodeJS.Timeout;
import * as vscode from 'vscode';
import { getNow } from './utils'
import {ReminderView} from './TextView'
export default class Scheduler {
    $option: Option
    constructor(prop: Option) {
        this.$option = { ...prop }
    }
    changeOptions(option: Option) {
        this.$option = option
    }
    changeListener(e?: any) {
        // if (e.contentChanges.length > 0) {
            if (timer) {
                clearTimeout(timer)
            }
            
            timer = setTimeout(() => {

            this.run()
            clearTimeout(timer)
            }, this.$option.commitTimeInterval)
        // }
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
            const reg = /\/.*\//
            const res = reg.exec(this.$option.path)
            if (res !== null) {
                const cmd = `cd ${res[0]} && git add . && git commit -n -m "自动提交" `;
                exec(cmd, (err, stdout) => {
                    if (err) {
                        ReminderView.show(this.$option.context,err.message)
                    } else {
                        this._getUnCommitChange(res[0]).then(res => {
                            ReminderView.show(this.$option.context,`${getNow()} 自动提交成功 ${stdout} ${res}`,)
                        })
                    }
                })
            }
        }else{

        }
    }
    destroy() {
        clearTimeout(timer)
    }
}