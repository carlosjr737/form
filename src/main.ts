import { EventHandlers } from './ui/eventHandlers';
import { SidebarRenderer } from './ui/renderers/sidebarRenderer';
import { StageRenderer } from './ui/renderers/stageRenderer';
import { TimelineRenderer } from './ui/renderers/timelineRenderer';
import { AppState } from './core/state';
import { DOMElements } from './ui/domElements';

class CoreoApp {
  private eventHandlers = new EventHandlers();
  private sidebarRenderer = new SidebarRenderer();
  private stageRenderer = new StageRenderer();
  private timelineRenderer = new TimelineRenderer();
  private appState = AppState.getInstance();
  private dom = DOMElements.getInstance();

  public init(): void {
    this.renderAll();
    this.eventHandlers.setupEventListeners();
    this.setupWindowEvents();
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

  private setupWindowEvents(): void {
    window.addEventListener('resize', () => {
      this.timelineRenderer.renderizarReguaTempo();
      this.timelineRenderer.renderizarFaixaAudio();
    });
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  const app = new CoreoApp();
  app.init();
});