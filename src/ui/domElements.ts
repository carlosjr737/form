export class DOMElements {
  private static instance: DOMElements;
  
  // Header elements
  public readonly tituloProjetoEl: HTMLElement;
  public readonly btnExportar: HTMLButtonElement;
  public readonly btnImportar: HTMLButtonElement;
  public readonly importFile: HTMLInputElement;
  public readonly btnCarregarAudio: HTMLButtonElement;
  public readonly audioFileInput: HTMLInputElement;
  public readonly audioInfoEl: HTMLElement;

  // Sidebar elements
  public readonly listaFormacoesEl: HTMLUListElement;
  public readonly btnAddFormacao: HTMLButtonElement;
  public readonly listaBailarinosEl: HTMLUListElement;
  public readonly buscaBailarinosInput: HTMLInputElement;

  // Stage elements
  public readonly btnAddBailarino: HTMLButtonElement;
  public readonly palcoEl: HTMLElement;

  // Playback controls
  public readonly btnPlayPause: HTMLButtonElement;
  public readonly btnAnterior: HTMLButtonElement;
  public readonly btnProxima: HTMLButtonElement;

  // Timeline elements
  public readonly timelineBlocosEl: HTMLElement;
  public readonly timelineContainerEl: HTMLElement;
  public readonly timeRulerEl: HTMLElement;
  public readonly audioTrackEl: HTMLElement;
  public readonly audioCanvas: HTMLCanvasElement;
  public readonly playheadEl: HTMLElement;

  // Zoom controls
  public readonly btnZoomOut: HTMLButtonElement;
  public readonly btnZoomIn: HTMLButtonElement;
  public readonly btnZoomReset: HTMLButtonElement;
  public readonly zoomValueEl: HTMLElement;

  private constructor() {
    // Header elements
    this.tituloProjetoEl = this.getElement('titulo-projeto');
    this.btnExportar = this.getElement('btn-exportar') as HTMLButtonElement;
    this.btnImportar = this.getElement('btn-importar') as HTMLButtonElement;
    this.importFile = this.getElement('import-file') as HTMLInputElement;
    this.btnCarregarAudio = this.getElement('btn-carregar-audio') as HTMLButtonElement;
    this.audioFileInput = this.getElement('audio-file-input') as HTMLInputElement;
    this.audioInfoEl = this.getElement('audio-info');

    // Sidebar elements
    this.listaFormacoesEl = this.getElement('lista-formacoes') as HTMLUListElement;
    this.btnAddFormacao = this.getElement('btn-add-formacao') as HTMLButtonElement;
    this.listaBailarinosEl = this.getElement('lista-bailarinos') as HTMLUListElement;
    this.buscaBailarinosInput = this.getElement('busca-bailarinos') as HTMLInputElement;

    // Stage elements
    this.btnAddBailarino = this.getElement('btn-add-bailarino') as HTMLButtonElement;
    this.palcoEl = this.getElement('palco');

    // Playback controls
    this.btnPlayPause = this.getElement('btn-play-pause') as HTMLButtonElement;
    this.btnAnterior = this.getElement('btn-anterior') as HTMLButtonElement;
    this.btnProxima = this.getElement('btn-proxima') as HTMLButtonElement;

    // Timeline elements
    this.timelineBlocosEl = this.getElement('timeline-blocos');
    this.timelineContainerEl = this.getElement('timeline-container');
    this.timeRulerEl = this.getElement('time-ruler');
    this.audioTrackEl = this.getElement('audio-track');
    this.audioCanvas = this.getElement('audio-canvas') as HTMLCanvasElement;
    this.playheadEl = this.getElement('playhead');

    // Zoom controls
    this.btnZoomOut = this.getElement('zoom-out') as HTMLButtonElement;
    this.btnZoomIn = this.getElement('zoom-in') as HTMLButtonElement;
    this.btnZoomReset = this.getElement('zoom-reset') as HTMLButtonElement;
    this.zoomValueEl = this.getElement('zoom-value');
  }

  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element with id '${id}' not found`);
    }
    return element;
  }

  public static getInstance(): DOMElements {
    if (!DOMElements.instance) {
      DOMElements.instance = new DOMElements();
    }
    return DOMElements.instance;
  }
}