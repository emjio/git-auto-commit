import { exec } from 'child_process';
// your extension is activated the very first time the command is executed
let timer: NodeJS.Timeout;
import * as vscode from 'vscode';
import { getNow,runCommand,throwErrorType } from './utils'
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
    private  async _getDiff(path:string){
        let cmd = `cd ${path} && git diff`;
        return await runCommand(cmd)
    }
    private async _getUnCommitChange(path: string) {
        let cmd = `cd ${path}`;
            if (this.$option.autoPush) {
                cmd = cmd + ' && git push'
            } else {
                cmd = cmd + ' && git status'
            }
            let res = ''
            return await runCommand(cmd)
    }
    async run() {
        if (this.$option.path) {
                // 执行之前先验证是否有差异
                const diff = await this._getDiff(this.$option.path)
                if(diff!==''){
                    const cmd = `cd ${this.$option.path} && git add . && git commit -n -m "auto-commit" `;
                    try{
                    const commitRes = await runCommand(cmd)
                    const UnCommitChange = await this._getUnCommitChange(this.$option.path as string)
                    ReminderView.show(this.$option.context,{diffRes:diff,commitRes,gitStatus:UnCommitChange},)
                    }catch(e:any){
                        const errorType = throwErrorType(e)
                        ReminderView.show(this.$option.context,e)
                    }
                }
            }
        }
    destroy() {
        clearTimeout(timer)
    }
}