export class AudioHostService {
  private readonly _audioContext: AudioContext;
  private readonly _duration: number;
  private _audioBuffer: AudioBuffer;
  private _source?: AudioBufferSourceNode;

  public constructor(audioContext: AudioContext, audioBuffer: AudioBuffer, duration: number) {
    this._duration = duration;
    this._audioContext = audioContext;
    this._audioBuffer = audioBuffer;
  }

  play() {
    console.log('Play event received!');
    // create audio source node (you cannot call start more than once)
    this._source = this._audioContext.createBufferSource();
    this._source.buffer = this._audioBuffer;
    this._source.connect(this._audioContext.destination);
    this._source.addEventListener('ended', () => this.stop());
    this._source.start(this._audioContext.currentTime, 0);

  }

  stop() {
    this._source?.stop();
    this._source = undefined;
  }
}