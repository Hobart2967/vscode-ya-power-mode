import * as glob from 'glob';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import * as vscode from 'vscode'
import { ExtensionContext } from 'vscode';
import { SoundFile } from '../shared/models/sound/soundfile.model';
import { ExtensionContextToken } from './models/extension-context';
import { SoundProcessorService } from './services/sound-processor.service';
import { SoundHostViewProvider } from './views/sound-host.view-provider';

@injectable()
export class PowerModeExtension {
	//#region Public Static Fields
	public static IDLE_TIME_MAX: number = 5;
	//#endregion

	//#region Private Fields
	private readonly _whitespaceRegex = /\s/g;
	private readonly _prefixes = ['dist'];
	//#endregion

	//#region Private Fields
	private _hasUsedMagazine = false;
	private _lastModified: Date = new Date(Date.now());
	private _totalShootCount: number = 0;
	private _sequenceShootCount: number = 0;
	private _gunIndex: number = 1;
	private _comboCount: number = 0;
	private _comboResponseTemplates: Array<{ sound: string, minCombo: number;}> = [
		{ sound: 'quake/firstblood.wav', minCombo: 250 },
		{ sound: 'quake/holyshit.wav', minCombo: 500 },
		{ sound: 'quake/ludicrouskill.wav', minCombo: 1000 }
	];
	private _comboResponses: Array<{ sound: string, minCombo: number; reached: boolean }> = [];
	public get comboCount(): number {
		return this._comboCount;
	}
	public set comboCount(v: number) {
		this._comboCount = v;
		this._soundHostViewProvider
			.sendMetadataUpdate({
				comboCount: this._comboCount
			});
	}

	private _soundMap: Map<string, SoundFile> = new Map();
	private _intervalId?: NodeJS.Timeout | number;
	//#endregion

	//#region Ctor
	public constructor(
		@inject(ExtensionContextToken) private readonly _context: ExtensionContext,
		@inject(SoundHostViewProvider) private readonly _soundHostViewProvider: SoundHostViewProvider) {
	}
	//#endregion

	//#region Public Methods
	public async onInit(): Promise<void> {
		this.startComboChecker();

		vscode.workspace.onDidChangeTextDocument(
			(event) => this.onDidChangeTextDocument(event));

		vscode.window.registerWebviewViewProvider(
			SoundHostViewProvider.viewType,
			this._soundHostViewProvider);

		const view = await this._soundHostViewProvider.view.value;
		view.webview.onDidReceiveMessage(event => {
			const { command } = event;

			if (command === 'receive-cache') {
				this.cacheAndSendSoundsToView();
			}
		})
	}

	public deactivate() {
		console.log('Bye!');
	}
	//#endregion

	//#region Private Methods
	private startComboChecker(): void {
		this._intervalId = setInterval(() => {
			if (!this.comboCountValid()) {
				this.resetCombos();
			}
		}, 500);
	}

	private resetCombos(): void {
		this.comboCount = 0;
		this._comboResponses = this._comboResponseTemplates
			.map(template => ({
				...template,
				reached: false
			}));
	}


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
		const changedText = event.contentChanges
			.map(change => change.text)
			.join('');

		const filteredChangedText = changedText.replace(this._whitespaceRegex, '');

		this.comboCount += filteredChangedText.length;

		if (filteredChangedText.length > 0) {
			this.playSound(`shots/gun1.wav`);
			this._hasUsedMagazine = true;
			this._lastModified = new Date(Date.now());
		} else if(/^[ \t]+$/g.test(changedText)) {
			console.log('HIT_NOTHING');
			// TODO: Find suitable sound file
			// Hit nothing sound
			this._hasUsedMagazine = true;
		} else if (this._hasUsedMagazine && filteredChangedText.length <= 0) {
			this.playSound(`shots/reload.wav`);
			this._hasUsedMagazine = false;
		}

		if (filteredChangedText.length > 30) {
			const explosions = [
				'explosion1.wav',
				'explosion2.wav',
				'explosion3.wav',
				'explosion4.wav',
				'explosion5.wav'
			];

			const explosion = explosions[Math.floor(Math.random()*explosions.length)];

			this.playSound(`shots/${explosion}`);
		}

		const nextResponse = this._comboResponses
			.find(response => response.minCombo < this.comboCount && !response.reached);

		if (nextResponse) {
			nextResponse.reached = true;
			this.playSound(nextResponse.sound);
		}
	}

	private comboCountValid() {
		const milisecondsSinceLastChange = new Date(Date.now()).getTime() - this._lastModified.getTime();
		const secondsSinceLastChange = Math.ceil(milisecondsSinceLastChange / 1000);
		return secondsSinceLastChange <= PowerModeExtension.IDLE_TIME_MAX;
	}


	/*	const length = event.contentChanges.reduce((prev, cur) => cur.text.length + prev, 0);
		this._totalShootCount += length;
		this._sequenceShootCount += length;

		const view = await this._soundHostViewProvider.view.value;
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
	}*/

	private async playSound(sound: string): Promise<void> {
		console.log(new Date(Date.now()).toISOString(), 'Playsound in server received');
		if (!this._soundHostViewProvider.view) {
			return;
		}

		console.log(new Date(Date.now()).toISOString(), 'Playsound sending');
		const view = await this._soundHostViewProvider.view.value;
		view.webview.postMessage({
			command: 'play',
			sound
		});

		console.log(new Date(Date.now()).toISOString(), 'Playsound sent');
	}

	private async sendCachedSoundFile(sound: string) {
		await this._soundHostViewProvider.view.value;
		this._soundHostViewProvider.sendCachedAudio(sound, this._soundMap.get(sound)!);
	}

	private async cacheAndSendSoundsToView(): Promise<void> {
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
			.filter(sound => !this._soundMap.has(sound))
			.map(sound =>
				this
					.loadAndCacheSound(sound)
					.catch(() => null)));

		await Promise.all(
			Array.from(this._soundMap
				.keys())
				.map(sound => this.sendCachedSoundFile(sound)));

		await this.playSound('quake/prepare.wav');
	}

	private async loadAndCacheSound(sound: string): Promise<SoundFile> {
		const soundFilePath = path.join(this._context.extensionPath, ...this._prefixes, 'sounds', sound);
		const file = await vscode.workspace.fs.readFile(vscode.Uri.parse(soundFilePath));
		const processor = new SoundProcessorService();
		const processedSoundFile = await processor.prepareSoundFile(file, 0, file.length);
		this._soundMap.set(sound, processedSoundFile);
		return processedSoundFile;
	}
	//#endregion


}