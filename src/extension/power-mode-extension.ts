import * as glob from 'glob';
import * as path from 'path';
import * as vscode from 'vscode'
import { ExtensionContext } from 'vscode';
import { SoundFile } from '../shared/models/soundfile.model';
import { SoundProcessorService } from './services/sound-processor.service';
import { SoundHostViewProvider } from './views/sound-host.view-provider';

export class PowerModeExtension {
	private readonly _prefixes = ['dist'];
	private _totalShootCount: number = 0;
	private _sequenceShootCount: number = 0;
	private _gunIndex: number = 1;
	private _soundHost: SoundHostViewProvider = null as any;

	//#region Ctor
	public constructor(private readonly _context: ExtensionContext) {
	}
	//#endregion

	//#region Public Methods
	public async onInit(): Promise<void> {
		if (!this.checkForMonkeyPatchExtension()) {
			return;
		}

		this._soundHost =  new SoundHostViewProvider(this._context.extensionUri);

		this.cacheSounds();
		vscode.workspace.onDidChangeTextDocument(
			(event) => this.onDidChangeTextDocument(event));

		vscode.window.registerWebviewViewProvider(
			SoundHostViewProvider.viewType,
			this._soundHost);
	}

	public deactivate() {
		console.log('Bye!');
	}
	//#endregion

	//#region Private Methods
	private checkForMonkeyPatchExtension(): boolean {
		let monkeyPatch = vscode.extensions.getExtension("iocave.monkey-patch");

		if (monkeyPatch !== undefined) {
			vscode.window.showInformationMessage("Power Mode is loading");
			monkeyPatch.exports.contribute("hobart2967.vscode-ya-power-mode", {
				folderMap: {
					"ya-power-mode": path.join('/home/marco/.config/Code/User/globalStorage/vscode-ya-powermode', "dist", "custom-modules"),
				},
				browserModules: ["ya-power-mode/browser1"],
				mainProcessModules: ["ya-power-mode/mainProcess1"]
			});
			return true;
		} else {
			vscode.window.showWarningMessage("Monkey Patch extension is not installed. This extension will not work.");
			return false;
		}
	}

	private async onDidChangeTextDocument(event: vscode.TextDocumentChangeEvent): Promise<void> {
		// gun${this._gunIndex}
		this.playSound(`shots/laser-gun.wav`);
		const length = event.contentChanges.reduce((prev, cur) => cur.text.length + prev, 0);
		this._totalShootCount += length;
		this._sequenceShootCount += length;

		const view = await this._soundHost.view.value;
		view.webview.postMessage({
			command: 'updateMetadata',
			totalShootCount: this._totalShootCount,
			sequenceShootCount: this._sequenceShootCount
		});

		if (Math.floor(Math.random()*50) > 25) {
			const farExplosions = [
				'explosion-far.wav',
				'explosion-far2.wav',
				'explosion-far3.wav'
			];

			const farExplosion = farExplosions[Math.floor(Math.random()*farExplosions.length)];

			this.playSound(`shots/${farExplosion}`);
		}

		if (this._sequenceShootCount > 50) {
			const explosionIndex = Math.floor(Math.random() * 6 + 1);
			this.playSound(`shots/explosion${explosionIndex}.wav`);
			this._sequenceShootCount = 0;

			this._gunIndex++;
			if (this._gunIndex > 4) {

				this._gunIndex = 1;
			}
		}
	}

	private async playSound(sound: string): Promise<void> {
		console.log(new Date(Date.now()).toISOString(), 'Playsound in server received');
		if (!this._soundHost.view) {
			return;
		}

		console.log(new Date(Date.now()).toISOString(), 'Playsound sending');
		const view = await this._soundHost.view.value;
		view.webview.postMessage({
			command: 'play',
			sound
		});
		console.log(new Date(Date.now()).toISOString(), 'Playsound sendt');

	}

	private async cacheSoundFile(sound: string, soundData: SoundFile) {
		const view = await this._soundHost.view.value;
		view.webview.postMessage({
			command: 'cacheAudio',
			sound,
			soundData: {
				...soundData,
				waveFile: undefined
			}
		})
	}

	private async cacheSounds(): Promise<void> {
		const soundsPath = path.join(this._context.extensionPath, ...this._prefixes, 'sounds');
		const sounds = await new Promise<string[]>((resolve, reject) =>
			glob("**/*.wav", {
				cwd: soundsPath
			}, function (error, files) {
				if (error) {
					reject(error);
					return;
				}

				resolve(files)
			}));

		await Promise.all(sounds
			.map(sound =>
				this
					.loadSound(sound)
					.then(soundLoaded => this.cacheSoundFile(sound, soundLoaded))
					.catch(() => null)));
	}

	private async loadSound(sound: string): Promise<SoundFile> {
		sound = path.join(this._context.extensionPath, ...this._prefixes, 'sounds', sound);
		const file = await vscode.workspace.fs.readFile(vscode.Uri.parse(sound));
		const processor = new SoundProcessorService();
		return processor.prepareSoundFile(file, 0, file.length);
	}
	//#endregion


}