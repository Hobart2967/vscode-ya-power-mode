import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { ViewData } from '../../browser/models/view-data.interface';
import { AsyncObject } from '../../shared/models/async-object';
import { SoundFile } from '../../shared/models/sound/soundfile.model';
import { ExtensionContextToken } from '../models/extension-context';

@injectable()
export class SoundHostViewProvider implements vscode.WebviewViewProvider {
	//#region Public Static Constants
  public static readonly viewType: string  = "vscode-ya-power-mode.combo-view";
  //#endregion

  //#region Private Fields
  private readonly _extensionUri: vscode.Uri;
  //#endregion

  //#region Properties
  private _view: AsyncObject<vscode.WebviewView> = new AsyncObject();
  public get view(): AsyncObject<vscode.WebviewView> {
    return this._view;
  }
  //#endregion

  //#region Ctor
  public constructor(
    @inject(ExtensionContextToken) extensionContext: vscode.ExtensionContext) {

    this._extensionUri = extensionContext.extensionUri;
  }
  //#endregion

  //#region Public Methods
  public async sendMetadataUpdate(viewData: ViewData): Promise<void> {
    const view = await this.view.value;
		view.webview.postMessage({
			command: 'updateMetadata',
      ...viewData
		});
	}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken,
  ) {
    this._view.setValue(webviewView);

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        this._extensionUri
      ]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
  }

  public async sendCachedAudio(sound: string, soundData: SoundFile): Promise<void> {
		const view = await this.view.value;
    view.webview.postMessage({
			command: 'cacheAudio',
			sound,
			soundData: {
				...soundData,
				waveFile: undefined
			}
		})
	}
  //#endregion

  private getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {

    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'dist', 'browser.js'));

    const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
    const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
    const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

    // Use a nonce to only allow a specific script to be run.
    const nonce = this.getNonce();

    return require('!!ejs-webpack-loader!./sound-host.view-provider.ejs')({
      webview,
      styleResetUri,
      styleVSCodeUri,
      styleMainUri,
      scriptUri,
      nonce
    });
  }
}
