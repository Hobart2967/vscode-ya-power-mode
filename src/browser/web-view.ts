import { SoundFile } from '../shared/models/sound/soundfile.model';
import { VSCodeApi } from './models/vscode-api.interface';
import { AudioHostService } from './services/audio-host.service';

declare var acquireVsCodeApi: () => VSCodeApi;
const ac = new AudioContext({ sampleRate: 44100 });
const cachedAudio = new Map<string, {
  buffer: AudioBuffer,
  file: SoundFile
}>();

function cacheAudio(sound: string, soundData: SoundFile) {
  const audioBuffer = ac.createBuffer(
    soundData.numberOfChannels,
    soundData.length,
    soundData.sampleRate);

  for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
    const f32a = new Float32Array(audioBuffer.length);
    audioBuffer.copyToChannel(f32a, ch);
  }

  for (let ch = 0; ch < soundData.numberOfChannels; ch++) {
    const f32a = new Float32Array(soundData.length);
    for (let i = 0; i < f32a.length; i++) {
        f32a[i] = soundData.waveData.samples[ch][i];
    }

    audioBuffer.copyToChannel(f32a, ch, soundData.waveData.start);
  }

  cachedAudio.set(sound, {
    buffer: audioBuffer,
    file: soundData
  });
}

function playSound(sound: string) {
  try {
    const cachedAudioFile = cachedAudio.get(sound);
    if (!cachedAudioFile) {
      console.warn(`Tried to play non-existend sound ${sound}`);
      return;
    }
    // set player ui
    const player = new AudioHostService(ac, cachedAudioFile!.buffer, cachedAudioFile!.file.duration);
    player.play();
  } catch (err) {
    console.error(err);
    throw err;
  }
}

(() => {
  console.log('Booting power mode...');

  const vscode = acquireVsCodeApi();
  vscode.postMessage({
    command: 'retrieve-cache'
  });

  window.addEventListener('message', async e => {
    const { command, soundData, isTrusted, sound } = e.data;

    switch (command) {
      case 'play':
        console.log(new Date(Date.now()).toISOString(), 'Play event received!');
        playSound(sound);
        break;

      case 'cacheAudio':
        console.log(new Date(Date.now()).toISOString(), 'cacheAudio event received!');
        if (!soundData || !sound) {
          console.error('No sound name or sounddata received');
        }
        cacheAudio(sound, soundData);
        break;

      case 'updateMetadata':
        const { totalShootCount } = e.data;
        document.querySelector('#counter')!.textContent = totalShootCount
        break;
    }
  });
})();


