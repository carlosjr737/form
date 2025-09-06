import { AppState } from '../../core/state';
import { DOMElements } from '../domElements';
import { TimelineUtils } from '../../utils/timelineUtils';
import type { Marcador, Formacao } from '../../types';

export class StageRenderer {
  private appState = AppState.getInstance();
  private dom = DOMElements.getInstance();

  public renderizarPalco(): void {
    this.dom.palcoEl.innerHTML = '';
    const f = this.appState.getFormacaoAtiva();
    if (!f) return;

    f.marcadores.forEach((m) => this.criarMarcador(m));
  }

  public renderizarPalcoEmTransicao(origem: Formacao | undefined, destino: Formacao, progresso: number): void {
    if (!origem || !destino) return;
    
    this.dom.palcoEl.innerHTML = '';
    origem.marcadores.forEach((ma) => {
      const mb = destino.marcadores.find((m) => m.id === ma.id);
      if (!mb) return;
      
      const x = TimelineUtils.lerp(ma.x, mb.x, progresso);
      const y = TimelineUtils.lerp(ma.y, mb.y, progresso);
      
      const div = document.createElement('div');
      div.className = 'marcador';
      div.textContent = ma.rotulo;
      div.style.backgroundColor = ma.cor;
      div.style.left = `${x}px`;
      div.style.top = `${y}px`;
      this.dom.palcoEl.appendChild(div);
    });
  }

  public renderizarPalcoEmPausa(formacao: Formacao): void {
    if (!formacao) return;
    
    if (this.appState.formacaoAtivaId !== formacao.id) {
      this.appState.setFormacaoAtiva(formacao.id);
      // TODO: Trigger sidebar re-render via callback
    }
    this.renderizarPalco();
  }

  private criarMarcador(marcador: Marcador): void {
    const div = document.createElement('div');
    div.className = 'marcador';
    div.dataset.id = marcador.id;
    div.textContent = marcador.rotulo;
    div.title = marcador.rotulo;
    div.style.backgroundColor = marcador.cor;
    div.style.left = `${marcador.x}px`;
    div.style.top = `${marcador.y}px`;

    div.addEventListener('dblclick', (e) => {
      e.preventDefault();
      // TODO: Check if playing via PlaybackManager
      const novo = prompt('Novo nome do bailarino:', marcador.rotulo);
      if (novo !== null) {
        const nome = novo.trim();
        if (nome.length) {
          // TODO: Implementar renomeação via callback
        }
      }
    });

    div.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      // TODO: Check if playing via PlaybackManager
      if (confirm(`Remover o bailarino ${marcador.rotulo}?`)) {
        // TODO: Implementar remoção via callback
      }
    });

    div.addEventListener('mousedown', (e) => {
      e.preventDefault();
      // TODO: Check if playing via PlaybackManager
      
      const startRect = div.getBoundingClientRect();
      const palcoRect = this.dom.palcoEl.getBoundingClientRect();
      const oX = e.clientX - startRect.left;
      const oY = e.clientY - startRect.top;

      const onMove = (ev: MouseEvent) => {
        let x = ev.clientX - palcoRect.left - oX;
        let y = ev.clientY - palcoRect.top - oY;
        
        x = Math.max(0, Math.min(x, palcoRect.width - startRect.width));
        y = Math.max(0, Math.min(y, palcoRect.height - startRect.height));
        
        if (ev.shiftKey) {
          x = Math.round(x / 40) * 40;
          y = Math.round(y / 40) * 40;
        }
        
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        marcador.x = x;
        marcador.y = y;
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    this.dom.palcoEl.appendChild(div);
  }
}