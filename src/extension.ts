import { ExtensionContext } from 'vscode';
import { PowerModeExtension } from './extension/power-mode-extension';

let extension: PowerModeExtension | null;
export function activate(context: ExtensionContext) {
	extension = new PowerModeExtension(context);
	extension.onInit();
}

export function deactivate() {
	extension?.deactivate();
	extension = null;
}
