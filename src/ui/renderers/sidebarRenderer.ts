import { AppState } from '../../core/state';
import { DOMElements } from '../domElements';
import type { BailarinoUnico } from '../../types';

export class SidebarRenderer {
  private appState = AppState.getInstance();
  private dom = DOMElements.getInstance();

  public renderizarBarraLateral(): void {
    this.dom.listaFormacoesEl.innerHTML = '';
    
    this.appState.db.formacoes.forEach((f) => {
      const li = document.createElement('li');
      li.dataset.id = f.id;
      if (f.id === this.appState.formacaoAtivaId) {
        li.classList.add('ativa');
      }

      const nome = document.createElement('span');
      nome.className = 'nome-formacao';
      nome.textContent = `${f.ordem}. ${f.nome}`;

      const btnEdit = document.createElement('button');
      btnEdit.className = 'icon';
      btnEdit.textContent = '✎';
      btnEdit.title = 'Renomear formação';
      btnEdit.addEventListener('click', (e) => {
        e.stopPropagation();
        this.iniciarEdicaoFormacao(li, f.id, f.nome);
      });

      const btnDel = document.createElement('button');
      btnDel.className = 'icon';
      btnDel.textContent = '×';
      btnDel.title = 'Remover formação';
      btnDel.addEventListener('click', (e) => {
        e.stopPropagation();
        // TODO: Implementar remoção
      });

      li.appendChild(nome);
      li.appendChild(btnEdit);
      li.appendChild(btnDel);

      li.addEventListener('click', () => {
        // TODO: Implementar mudança de formação ativa via callback
      });

      li.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        this.iniciarEdicaoFormacao(li, f.id, f.nome);
      });

      this.dom.listaFormacoesEl.appendChild(li);
    });
  }

  public renderizarPainelBailarinos(): void {
    const termo = (this.dom.buscaBailarinosInput?.value || '').trim().toLowerCase();
    const todos = this.getBailarinosUnicos();
    const filtrados = termo ? todos.filter((b) => b.rotulo.toLowerCase().includes(termo)) : todos;

    this.dom.listaBailarinosEl.innerHTML = '';
    
    filtrados.forEach((b) => {
      const li = document.createElement('li');
      li.className = 'bailarino-item';
      li.dataset.id = b.id;

      const cor = document.createElement('span');
      cor.className = 'cor-dot';
      cor.style.backgroundColor = b.cor;

      const nome = document.createElement('span');
      nome.className = 'nome';
      nome.textContent = b.rotulo;
      nome.title = b.rotulo;

      const edit = document.createElement('button');
      edit.className = 'edit';
      edit.textContent = '✎';
      edit.title = 'Renomear';

      li.addEventListener('click', (e) => {
        if (e.target === edit) return;
        this.focarBailarinoNoPalco(b.id);
      });

      li.addEventListener('dblclick', () => {
        this.iniciarEdicaoBailarino(li, b.id, b.rotulo);
      });

      edit.addEventListener('click', (e) => {
        e.stopPropagation();
        this.iniciarEdicaoBailarino(li, b.id, b.rotulo);
      });

      li.appendChild(cor);
      li.appendChild(nome);
      li.appendChild(edit);
      this.dom.listaBailarinosEl.appendChild(li);
    });
  }

  private iniciarEdicaoFormacao(li: HTMLLIElement, id: string, nomeAtual: string): void {
    const nomeSpan = li.querySelector('.nome-formacao');
    if (!nomeSpan) return;

    const input = document.createElement('input');
    input.className = 'edit-input';
    input.value = nomeAtual;
    li.replaceChild(input, nomeSpan);
    input.focus();
    input.select();

    const confirmar = () => {
      const novo = input.value.trim();
      if (novo && novo !== nomeAtual) {
        // TODO: Implementar renomeação via callback
      }
      this.renderizarBarraLateral();
    };

    const cancelar = () => {
      this.renderizarBarraLateral();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmar();
      else if (e.key === 'Escape') cancelar();
    });

    input.addEventListener('blur', confirmar);
  }

  private iniciarEdicaoBailarino(li: HTMLLIElement, id: string, atual: string): void {
    const nomeSpan = li.querySelector('.nome');
    if (!nomeSpan) return;

    const input = document.createElement('input');
    input.className = 'edit-input';
    input.value = atual;
    li.replaceChild(input, nomeSpan);
    input.focus();
    input.select();

    const confirmar = () => {
      const novo = input.value.trim();
      if (novo && novo !== atual) {
        // TODO: Implementar renomeação de bailarino via callback
      }
      this.renderizarPainelBailarinos();
    };

    const cancelar = () => {
      this.renderizarPainelBailarinos();
    };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') confirmar();
      else if (e.key === 'Escape') cancelar();
    });

    input.addEventListener('blur', confirmar);
  }

  private getBailarinosUnicos(): BailarinoUnico[] {
    const mapa = new Map<string, BailarinoUnico>();
    
    this.appState.db.formacoes.forEach((f) => {
      f.marcadores.forEach((m) => {
        if (!mapa.has(m.id)) {
          mapa.set(m.id, { id: m.id, rotulo: m.rotulo, cor: m.cor });
        }
      });
    });

    return Array.from(mapa.values()).sort((a, b) => 
      a.rotulo.localeCompare(b.rotulo, 'pt-BR', { sensitivity: 'base' })
    );
  }

  private focarBailarinoNoPalco(id: string): void {
    const el = this.dom.palcoEl.querySelector(`[data-id="${id}"]`) as HTMLElement;
    if (!el) return;
    
    el.classList.add('selecionado');
    setTimeout(() => el.classList.remove('selecionado'), 800);
  }
}