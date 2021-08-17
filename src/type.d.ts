
import {ExtensionContext} from 'vscode';
declare global {
	interface Option {
		path?:string;
		commitTimeInterval: number;
		autoPush: boolean;
		context:ExtensionContext
	}
}



