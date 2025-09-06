export class DOMElements {
  private static instance: DOMElements;
  
  // Header elements
  public readonly tituloProjetoEl = document.getElementById('titulo-projeto') as HTMLElement;
  public readonly btnExportar = document.getElementById('btn-exportar') as HTMLButtonElement;
  public readonly btnImportar = document.getElementById('btn-importar') as HTMLButtonElement;
  public readonly importFile = document.getElementById('import-file') as HTMLInputElement;
  public readonly btnCarregarAudio = document.getElementById('btn-carregar-audio') as HTMLButtonElement;
  public readonly audioFileInput = document.getElementById('audio-file-input') as HTMLInputElement;
  public readonly audioInfoEl = document.getElementById('audio-info') as HTMLElement;

  // Sidebar elements
  public readonly listaFormacoesEl = document.getElementById('lista-formacoes') as HTMLUListElement;
  public readonly btnAddFormacao = document.getElementById('btn-add-formacao') as HTMLButtonElement;
  public readonly listaBailarinosEl = document.getElementById('lista-bailarinos') as HTMLUListElement;
  public readonly buscaBailarinosInput = document.getElementById('busca-bailarinos') as HTMLInputElement;

  // Stage elements
  public readonly btnAddBailarino = document.getElementById('btn-add-bailarino') as HTMLButtonElement;
  public readonly palcoEl = document.getElementById('palco') as HTMLElement;

  // Playback controls
  public readonly btnPlayPause = document.getElementById('btn-play-pause') as HTMLButtonElement;
  public readonly btnAnterior = document.getElementById('btn-anterior') as HTMLButtonElement;
  public readonly btnProxima = document.getElementById('btn-proxima') as HTMLButtonElement;

  // Timeline elements
  public readonly timelineBlocosEl = document.getElementById('timeline-blocos') as HTMLElement;
  public readonly timelineContainerEl = document.getElementById('timeline-container') as HTMLElement;
  public readonly timeRulerEl = document.getElementById('time-ruler') as HTMLElement;
  public readonly audioTrackEl = document.getElementById('audio-track') as HTMLElement;
  public readonly audioCanvas = document.getElementById('audio-canvas') as HTMLCanvasElement;
  public readonly playheadEl = document.getElementById('playhead') as HTMLElement;

  // Zoom controls
  public readonly btnZoomOut = document.getElementById('zoom-out') as HTMLButtonElement;
  public readonly btnZoomIn = document.getElementById('zoom-in') as HTMLButtonElement;
  public readonly btnZoomReset = document.getElementById('zoom-reset') as HTMLButtonElement;
  public readonly zoomValueEl = document.getElementById('zoom-value') as HTMLElement;

  private constructor() {}

  public static getInstance(): DOMElements {
    if (!DOMElements.instance) {
      DOMElements.instance = new DOMElements();
    }
    return DOMElements.instance;
  }
}