import { WaveFile } from 'wavefile';
import { WaveFileEx } from './wave-file-ex.model';

export interface SoundFile {
  sampleRate: number;
  numberOfChannels: number
  length: number;
  duration: number;

  waveFile: WaveFile & WaveFileEx;
  waveData: {
    samples: Float64Array[];
    length: number;
    start: number;
    end: number;
  }
}