import { AppState } from '../core/state';
import { AudioManager } from '../audio/audioManager';
import { PlaybackManager } from '../playback/playbackManager';
import { DOMElements } from './domElements';
import { SidebarRenderer } from './renderers/sidebarRenderer';
import { StageRenderer } from './renderers/stageRenderer';
import { TimelineRenderer } from './renderers/timelineRenderer';

export class EventHandlers {
  private appState = AppState.getInstance();
  private audioManager = AudioManager.getInstance();
  private playbackManager = PlaybackManager.getInstance();
  private dom = DOMElements.getInstance();
  private sidebarRenderer = new SidebarRenderer();
  private stageRenderer = new StageRenderer();
  private timelineRenderer = new TimelineRenderer();

  public setupEventListeners(): void {
    this.setupAudioEvents();
    this.setupPlaybackEvents();
    this.setupNavigationEvents();
    this.setupZoomEvents();
    this.setupImportExportEvents();
    this.setupKeyboardEvents();
    this.setupTimelineEvents();
    this.setupSearchEvents();
  }

  private setupAudioEvents(): void {
    this.dom.btnCarregarAudio.addEventListener('click', () => {
      this.dom.audioFileInput.click();
    });

    this.dom.audioFileInput.addEventListener('change', async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      this.dom.audioInfoEl.innerHTML = `<span class="hint">Processando áudio...</span>`;
      
      try {
        await this.audioManager.loadAudioFile(file);
        this.dom.audioInfoEl.textContent = `Áudio: ${file.name.substring(0, 25)}... (${this.audioManager.getDuration().toFixed(1)}s)`;
        this.renderAll();
      } catch (error) {
        this.dom.audioInfoEl.innerHTML = `<span class="hint">Erro ao carregar áudio</span>`;
        alert(`Erro: ${(error as Error).message}`);
      }
    });
  }

  private setupPlaybackEvents(): void {
    this.dom.btnPlayPause.addEventListener('click', () => {
      if (this.playbackManager.isPlaying) {
        this.playbackManager.pausePlayback();
      } else {
        this.playbackManager.startPlayback();
      }
    });

    this.dom.btnAnterior.addEventListener('click', () => {
      const i = this.appState.db.formacoes.findIndex(f => f.id === this.appState.formacaoAtivaId);
      if (i > 0) {
        // TODO: Implementar mudança de formação
      }
    });

    this.dom.btnProxima.addEventListener('click', () => {
      const i = this.appState.db.formacoes.findIndex(f => f.id === this.appState.formacaoAtivaId);
      if (i < this.appState.db.formacoes.length - 1) {
        // TODO: Implementar mudança de formação
      }
    });
  }

  private setupNavigationEvents(): void {
    this.dom.btnAddFormacao.addEventListener('click', () => {
      // TODO: Implementar adição de formação
    });

    this.dom.btnAddBailarino.addEventListener('click', () => {
      // TODO: Implementar adição de bailarino
    });
  }

  private setupZoomEvents(): void {
    this.dom.btnZoomOut?.addEventListener('click', () => {
      this.timelineRenderer.setZoom(this.timelineRenderer.getZoom() - 0.25);
    });

    this.dom.btnZoomIn?.addEventListener('click', () => {
      this.timelineRenderer.setZoom(this.timelineRenderer.getZoom() + 0.25);
    });

    this.dom.btnZoomReset?.addEventListener('click', () => {
      this.timelineRenderer.setZoom(1);
    });
  }

  private setupImportExportEvents(): void {
    this.dom.btnExportar.addEventListener('click', () => {
      this.exportarJSON();
    });

    this.dom.btnImportar.addEventListener('click', () => {
      this.dom.importFile.click();
    });

    this.dom.importFile.addEventListener('change', (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        this.importarJSON(file);
        (e.target as HTMLInputElement).value = '';
      }
    });
  }

  private setupKeyboardEvents(): void {
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (this.playbackManager.isPlaying) {
          this.playbackManager.pausePlayback();
        } else {
          this.playbackManager.startPlayback();
        }
      } else if (e.key === 'ArrowLeft') {
        const i = this.appState.db.formacoes.findIndex(f => f.id === this.appState.formacaoAtivaId);
        if (i > 0) {
          // TODO: Implementar navegação
        }
      } else if (e.key === 'ArrowRight') {
        const i = this.appState.db.formacoes.findIndex(f => f.id === this.appState.formacaoAtivaId);
        if (i < this.appState.db.formacoes.length - 1) {
          // TODO: Implementar navegação
        }
      }
    });
  }

  private setupTimelineEvents(): void {
    this.dom.timelineContainerEl.addEventListener('scroll', () => {
      this.dom.timeRulerEl.scrollLeft = this.dom.timelineContainerEl.scrollLeft;
      this.timelineRenderer.renderizarFaixaAudio();
    });

    // TODO: Implementar scrubbing events
  }

  private setupSearchEvents(): void {
    this.dom.buscaBailarinosInput?.addEventListener('input', () => {
      this.sidebarRenderer.renderizarPainelBailarinos();
    });
  }

  private exportarJSON(): void {
    const blob = new Blob([JSON.stringify(this.appState.db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.appState.db.projeto.titulo.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  private importarJSON(arquivo: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data?.formacoes?.length) {
          throw new Error('Formato inválido');
        }
        this.appState.db = data;
        this.appState.formacaoAtivaId = this.appState.db.formacoes[0]?.id || null;
        this.renderAll();
      } catch (err) {
        alert('Falha ao importar JSON: ' + (err as Error).message);
      }
    };
    reader.readAsText(arquivo);
  }

  private renderAll(): void {
    this.appState.db.formacoes.sort((a, b) => a.ordem - b.ordem);
    this.dom.tituloProjetoEl.textContent = this.appState.db.projeto.titulo;
    this.sidebarRenderer.renderizarBarraLateral();
    this.stageRenderer.renderizarPalco();
    this.timelineRenderer.renderizarLinhaDoTempo();
    this.timelineRenderer.renderizarReguaTempo();
    this.sidebarRenderer.renderizarPainelBailarinos();
    this.timelineRenderer.renderizarFaixaAudio();
  }
}