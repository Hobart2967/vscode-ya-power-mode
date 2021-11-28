import { WaveFile } from 'wavefile';
import { SoundFile } from '../../shared/models/soundfile.model';
import { WaveFileEx } from '../../shared/models/wave-file-ex.model';

export class SoundProcessorService {
  public async prepareSoundFile(buffer: Uint8Array, start: number, end: number): Promise<SoundFile> {
    const waveFile = new WaveFile(buffer) as (WaveFile & WaveFileEx);
    try {
      this.decomposeFile(waveFile);

      const { bitsPerSample, audioFormat, sampleRate, numChannels: numberOfChannels } = waveFile.fmt;
      const samples = this.getSamples(waveFile, numberOfChannels);

      const length = (samples as Float64Array[])[0].length;

      const relocatedSamples = new Array(numberOfChannels);
      for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex++) {
        relocatedSamples[channelIndex] = samples[channelIndex].slice(start, end);
      }

      // convert to [-1,1] float32
      if (audioFormat === 1) {
        const max = 1 << (bitsPerSample - 1);
        for (let channelIndex = 0; channelIndex < numberOfChannels; channelIndex++) {
          for (let i = 0; i < relocatedSamples[channelIndex].length; i++) {
            const v = relocatedSamples[channelIndex][i];
            relocatedSamples[channelIndex][i] = v < 0
              ? v / max
              : v / (max - 1);
          }
        }
      }

      return {
        sampleRate,
        numberOfChannels,
        length,
        duration: length / sampleRate,
        waveFile,
        waveData: {
          samples: relocatedSamples,
          length: relocatedSamples.length,
          start,
          end
        }
      };
    } catch (err: any) {
      throw err;
    }
  }

  private getSamples(wav: WaveFile & WaveFileEx, numberOfChannels: number): Float64Array[] {
    let samples = wav.getSamples(false, Float32Array) as Float64Array | Float64Array[];
    if (numberOfChannels === 1) {
      samples = [samples] as Float64Array[];
    }

    wav.samples = samples as Float64Array[];

    return samples as Float64Array[];
  }

  private decomposeFile(wav: WaveFile & WaveFileEx) {
    switch (wav.fmt.audioFormat) {
      case 1:
      case 3:
        break;

      case 6:
        wav.fromALaw();
        break;

      case 7:
        wav.fromMuLaw();
        break;

      case 17:
        wav.fromIMAADPCM();
        break;

      default:
        throw new Error(`Unsupported audio format: ${wav.fmt.audioFormat}`);
    }
  }
}