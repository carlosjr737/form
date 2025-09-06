import { AppState } from '../../core/state';
import { AudioManager } from '../../audio/audioManager';
import { DOMElements } from '../domElements';
import { TimelineUtils } from '../../utils/timelineUtils';
import { ZOOM_CONFIG } from '../../utils/constants';

export class TimelineRenderer {
  private appState = AppState.getInstance();
  private audioManager = AudioManager.getInstance();
  private dom = DOMElements.getInstance();
  private zoom: number = 1;

  public renderizarLinhaDoTempo(): void {
    this.dom.timelineBlocosEl.innerHTML = '';

    const totalSeg = this.getTimelineTotalSegundos();
    const totalPx = this.getTotalTimelinePx();
    this.dom.timelineBlocosEl.style.width = totalPx + 'px';

    this.appState.db.formacoes.forEach((f) => {
      const tempoTotalDoBloco = f.duracaoSegundos + f.tempoTransicaoEntradaSegundos;

      const bloco = document.createElement('div');
      bloco.className = 'bloco-formacao';
      if (f.id === this.appState.formacaoAtivaId) {
        bloco.classList.add('ativa');
      }

      const blocoPx = (tempoTotalDoBloco / totalSeg) * totalPx;
      bloco.style.width = `${blocoPx}px`;

      const texto = document.createElement('span');
      texto.textContent = f.nome;
      bloco.appendChild(texto);

      // Event listeners
      bloco.addEventListener('click', (e) => {
        if (e.shiftKey) {
          this.editarTemposFormacao(f);
        } else {
          // TODO: Implementar mudança de formação ativa
        }
      });

      bloco.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const novo = prompt('Novo nome da formação:', f.nome);
        if (novo !== null) {
          const n = novo.trim();
          if (n) {
            // TODO: Implementar renomeação
          }
        }
      });

      this.adicionarSubBlocoTransicao(bloco, f, tempoTotalDoBloco);
      this.adicionarHandleDuracao(bloco, f, totalSeg);

      this.dom.timelineBlocosEl.appendChild(bloco);
    });
  }

  public renderizarReguaTempo(): void {
    if (!this.dom.timeRulerEl || !this.dom.timelineContainerEl) return;

    const total = this.getTimelineTotalSegundos();
    const totalPx = this.getTotalTimelinePx();

    this.dom.timeRulerEl.innerHTML = '';
    this.dom.timeRulerEl.scrollLeft = this.dom.timelineContainerEl.scrollLeft;

    const content = document.createElement('div');
    content.id = 'time-ruler-content';
    content.style.position = 'relative';
    content.style.height = '100%';
    content.style.width = totalPx + 'px';

    const step = TimelineUtils.escolherStep(total, totalPx);
    for (let t = 0; t <= total + 1e-6; t += step) {
      const p = t / total;
      const x = Math.round(p * totalPx);

      const tick = document.createElement('div');
      tick.className = 'tick' + ((Math.round(t / step) % 2 === 0) ? ' major' : '');
      tick.style.left = `${x}px`;

      const label = document.createElement('div');
      label.className = 'tick-label';
      label.style.left = `${x}px`;
      label.textContent = TimelineUtils.formatarTempo(t);

      content.appendChild(tick);
      content.appendChild(label);
    }

    this.dom.timeRulerEl.appendChild(content);
  }

  public renderizarFaixaAudio(): void {
    const ctx = this.dom.audioCanvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const wCss = Math.max(1, this.dom.audioTrackEl.clientWidth);
    const hCss = Math.max(1, this.dom.audioTrackEl.clientHeight);

    this.dom.audioCanvas.width = Math.floor(wCss * dpr);
    this.dom.audioCanvas.height = Math.floor(hCss * dpr);

    const w = this.dom.audioCanvas.width;
    const h = this.dom.audioCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0d1730';
    ctx.fillRect(0, 0, w, h);

    if (!this.audioManager.waveformData || this.audioManager.waveformData.length === 0) {
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();
      return;
    }

    const totalPx = this.getTotalTimelinePx();
    const viewStartPx = this.dom.timelineContainerEl.scrollLeft;
    const viewEndPx = viewStartPx + this.dom.timelineContainerEl.clientWidth;

    const startP = totalPx > 0 ? viewStartPx / totalPx : 0;
    const endP = totalPx > 0 ? viewEndPx / totalPx : 1;

    const startIndex = Math.floor(startP * this.audioManager.waveformData.length);
    const endIndex = Math.min(this.audioManager.waveformData.length, Math.ceil(endP * this.audioManager.waveformData.length));
    const slice = this.audioManager.waveformData.slice(startIndex, endIndex);

    const waveColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--cor-onda-audio')
      .trim() || '#5eead4';
    ctx.fillStyle = waveColor;

    const barWidth = w / Math.max(1, slice.length);
    for (let i = 0; i < slice.length; i++) {
      const value = slice[i];
      const barHeight = value * h;
      const y = (h - barHeight) / 2;
      const x = Math.floor(i * barWidth);
      const bw = Math.max(1, Math.floor(barWidth));
      ctx.fillRect(x, y, bw, barHeight);
    }
  }

  public setZoom(newZoom: number): void {
    this.zoom = Math.max(ZOOM_CONFIG.MIN, Math.min(ZOOM_CONFIG.MAX, newZoom));
    if (this.dom.zoomValueEl) {
      this.dom.zoomValueEl.textContent = Math.round(this.zoom * 100) + '%';
    }

    this.renderizarReguaTempo();
    this.renderizarLinhaDoTempo();
    this.renderizarFaixaAudio();
  }

  public getZoom(): number {
    return this.zoom;
  }

  private getTimelineTotalSegundos(): number {
    return TimelineUtils.getTimelineTotalSegundos(this.appState.db.formacoes, this.audioManager.getDuration());
  }

  private getTotalTimelinePx(): number {
    const totalSeg = Math.max(1, this.getTimelineTotalSegundos());
    return Math.max(1, Math.floor(totalSeg * ZOOM_CONFIG.BASE_PX_PER_SEC * this.zoom));
  }

  private editarTemposFormacao(f: any): void {
    // TODO: Implementar pausa do playback via PlaybackManager
    const nd = prompt(`Editar DURAÇÃO (s) para "${f.nome}":`, f.duracaoSegundos);
    if (nd !== null && !isNaN(Number(nd)) && Number(nd) >= 0) {
      f.duracaoSegundos = parseFloat(nd);
    }
    
    const nt = prompt(`Editar TRANSIÇÃO (s) para "${f.nome}":`, f.tempoTransicaoEntradaSegundos);
    if (nt !== null && !isNaN(Number(nt)) && Number(nt) >= 0) {
      f.tempoTransicaoEntradaSegundos = parseFloat(nt);
    }
    
    // TODO: Re-render tudo via callback
  }

  private adicionarSubBlocoTransicao(bloco: HTMLElement, f: any, tempoTotalDoBloco: number): void {
    if (tempoTotalDoBloco <= 0) return;

    const sub = document.createElement('div');
    sub.className = 'sub-bloco-transicao';
    sub.style.width = `${(f.tempoTransicaoEntradaSegundos / tempoTotalDoBloco) * 100}%`;
    sub.title = `Transição: ${f.tempoTransicaoEntradaSegundos}s`;

    const handleSplit = document.createElement('div');
    handleSplit.className = 'handle handle-split';
    handleSplit.title = 'Arraste para ajustar transição';
    
    handleSplit.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      // TODO: Implementar pausa do playback
      
      const blocoRect = bloco.getBoundingClientRect();
      const startX = e.clientX;
      const transIni = f.tempoTransicaoEntradaSegundos;
      const totalBloco = f.tempoTransicaoEntradaSegundos + f.duracaoSegundos;
      
      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const secPerPx = totalBloco / (blocoRect.width || 1);
        let novaTrans = transIni + dx * secPerPx;
        const minDur = 0.1;
        novaTrans = Math.max(0, Math.min(totalBloco - minDur, novaTrans));
        sub.style.width = `${(novaTrans / totalBloco) * 100}%`;
        sub.title = `Transição: ${novaTrans.toFixed(2)}s`;
      };
      
      const onUp = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const secPerPx = totalBloco / (blocoRect.width || 1);
        let novaTrans = transIni + dx * secPerPx;
        const minDur = 0.1;
        novaTrans = Math.max(0, Math.min(totalBloco - minDur, novaTrans));
        f.tempoTransicaoEntradaSegundos = +novaTrans.toFixed(2);
        f.duracaoSegundos = +(totalBloco - novaTrans).toFixed(2);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        // TODO: Re-render tudo
      };
      
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    
    sub.appendChild(handleSplit);
    bloco.appendChild(sub);
  }

  private adicionarHandleDuracao(bloco: HTMLElement, f: any, totalTimelineLocal: number): void {
    const handleEnd = document.createElement('div');
    handleEnd.className = 'handle handle-end';
    handleEnd.title = 'Arraste para ajustar duração';
    
    handleEnd.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      // TODO: Implementar pausa do playback
      
      const timelineRect = this.dom.timelineContainerEl.getBoundingClientRect();
      const startX = e.clientX;
      const durIni = f.duracaoSegundos;
      
      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const secPerPxContainer = totalTimelineLocal / (timelineRect.width || 1);
        let novaDur = durIni + dx * secPerPxContainer * (this.dom.timelineContainerEl.clientWidth / this.getTotalTimelinePx());
        novaDur = Math.max(0.1, novaDur);
        bloco.title = `Duração: ${novaDur.toFixed(2)}s`;
      };
      
      const onUp = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const secPerPxContainer = totalTimelineLocal / (timelineRect.width || 1);
        let novaDur = durIni + dx * secPerPxContainer * (this.dom.timelineContainerEl.clientWidth / this.getTotalTimelinePx());
        novaDur = Math.max(0.1, novaDur);
        f.duracaoSegundos = +novaDur.toFixed(2);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        // TODO: Re-render tudo
      };
      
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
    
    bloco.appendChild(handleEnd);
  }
}