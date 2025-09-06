import { AudioManager } from '../audio/audioManager';
import { AppState } from '../core/state';
import { TimelineUtils } from '../utils/timelineUtils';

export class PlaybackManager {
  private static instance: PlaybackManager;
  
  public isPlaying: boolean = false;
  private playbackLoopId: number | null = null;
  private tempoInicioPlayback: number = 0;
  private tempoPausadoAcumulado: number = 0;

  private audioManager = AudioManager.getInstance();
  private appState = AppState.getInstance();

  private constructor() {}

  public static getInstance(): PlaybackManager {
    if (!PlaybackManager.instance) {
      PlaybackManager.instance = new PlaybackManager();
    }
    return PlaybackManager.instance;
  }

  public async startPlayback(): Promise<void> {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    this.updatePlayButton();

    let offsetMs = this.appState.globalMsAtual;
    if (offsetMs === 0) {
      const idx = this.appState.db.formacoes.findIndex(f => f.id === this.appState.formacaoAtivaId);
      offsetMs = TimelineUtils.calcularTempoAcumuladoAteFormacao(idx, this.appState.db.formacoes);
      this.appState.globalMsAtual = offsetMs;
    }

    if (this.audioManager.audioBuffer && this.audioManager.audioContext) {
      await this.audioManager.startPlayback(offsetMs / 1000);
      this.tempoInicioPlayback = this.audioManager.getCurrentTime() - (offsetMs / 1000);
    } else {
      this.tempoInicioPlayback = performance.now() - offsetMs;
    }

    this.playbackLoopId = requestAnimationFrame(this.playbackLoop.bind(this));
  }

  public pausePlayback(): void {
    if (!this.isPlaying) return;
    
    this.isPlaying = false;
    this.updatePlayButton();
    
    if (this.playbackLoopId) {
      cancelAnimationFrame(this.playbackLoopId);
    }

    if (this.audioManager.audioSourceNode && this.audioManager.audioContext) {
      this.appState.globalMsAtual = (this.audioManager.getCurrentTime() - this.tempoInicioPlayback) * 1000;
      this.audioManager.stopPlayback();
    } else {
      this.appState.globalMsAtual = performance.now() - this.tempoInicioPlayback;
    }
  }

  public stopPlayback(): void {
    this.isPlaying = false;
    this.updatePlayButton();
    
    if (this.playbackLoopId) {
      cancelAnimationFrame(this.playbackLoopId);
    }

    this.audioManager.stopPlayback();
  }

  private playbackLoop(timestamp: number): void {
    if (!this.isPlaying) return;

    let tempoDecorridoMs: number;
    if (this.audioManager.audioBuffer && this.audioManager.audioContext) {
      tempoDecorridoMs = (this.audioManager.getCurrentTime() - this.tempoInicioPlayback) * 1000;
    } else {
      if (this.tempoInicioPlayback === 0) {
        this.tempoInicioPlayback = timestamp - this.tempoPausadoAcumulado;
      }
      tempoDecorridoMs = timestamp - this.tempoInicioPlayback;
    }

    const duracaoTotalMs = TimelineUtils.getTimelineTotalMs(this.appState.db.formacoes, this.audioManager.getDuration());
    if (tempoDecorridoMs >= duracaoTotalMs) {
      this.stopPlayback();
      return;
    }

    this.appState.globalMsAtual = tempoDecorridoMs;
    this.playbackLoopId = requestAnimationFrame(this.playbackLoop.bind(this));
  }

  private updatePlayButton(): void {
    const btn = document.getElementById('btn-play-pause');
    if (btn) {
      btn.textContent = this.isPlaying ? '❚❚ Pause' : '▶ Play';
    }
  }
}