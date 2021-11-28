export interface WaveFileEx {
  fmt: {
    audioFormat: number;
    numChannels: number;
    sampleRate: number;
    bitsPerSample: number;
  }
  samples: Float64Array[];
}