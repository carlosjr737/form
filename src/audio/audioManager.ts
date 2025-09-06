export class AudioManager {
  private static instance: AudioManager;
  
  public audioContext: AudioContext | null = null;
  public audioBuffer: AudioBuffer | null = null;
  public audioSourceNode: AudioBufferSourceNode | null = null;
  public waveformData: number[] | null = null;

  private constructor() {}

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public async initializeAudioContext(): Promise<void> {
    if (this.audioContext) return;
    
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      throw new Error("Seu navegador não suporta a Web Audio API, necessária para a funcionalidade de áudio.");
    }
  }

  public async loadAudioFile(file: File): Promise<void> {
    if (!file) return;
    
    await this.initializeAudioContext();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!this.audioContext) {
          reject(new Error('AudioContext não inicializado'));
          return;
        }

        this.audioContext.decodeAudioData(
          arrayBuffer,
          (decodedBuffer) => {
            this.audioBuffer = decodedBuffer;
            this.processAudioForVisualization();
            resolve();
          },
          (error) => {
            reject(new Error(`Não foi possível processar este arquivo de áudio. Erro: ${error.message}`));
          }
        );
      };
      reader.readAsArrayBuffer(file);
    });
  }

  private processAudioForVisualization(): void {
    if (!this.audioBuffer) return;
    
    const rawData = this.audioBuffer.getChannelData(0);
    const samples = 256;
    const blockSize = Math.floor(rawData.length / samples);
    const filteredData: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      let blockStart = blockSize * i;
      let sum = 0;
      for (let j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j]);
      }
      filteredData.push(sum / blockSize);
    }
    
    const maxVal = Math.max(...filteredData);
    const safeMax = maxVal > 0 ? maxVal : 1;
    const multiplier = 1 / safeMax;
    this.waveformData = filteredData.map(n => n * multiplier);
  }

  public getDuration(): number {
    return this.audioBuffer?.duration || 0;
  }

  public async startPlayback(offsetSeconds: number = 0): Promise<void> {
    if (!this.audioBuffer || !this.audioContext) return;

    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.audioSourceNode = this.audioContext.createBufferSource();
    this.audioSourceNode.buffer = this.audioBuffer;
    this.audioSourceNode.connect(this.audioContext.destination);
    
    const safeOffset = Math.min(offsetSeconds, Math.max(0, this.audioBuffer.duration - 0.001));
    this.audioSourceNode.start(0, safeOffset);
  }

  public stopPlayback(): void {
    if (this.audioSourceNode) {
      try {
        this.audioSourceNode.stop();
      } catch {}
      this.audioSourceNode = null;
    }
  }

  public getCurrentTime(): number {
    if (!this.audioContext) return 0;
    return this.audioContext.currentTime;
  }
}