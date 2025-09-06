import type { Database } from '../types';

export class AppState {
  private static instance: AppState;
  
  public db: Database = {
    projeto: { id: 'proj1', titulo: 'Coreografia v9' },
    formacoes: [
      {
        id: 'f1',
        nome: 'Início',
        ordem: 1,
        duracaoSegundos: 2,
        tempoTransicaoEntradaSegundos: 0,
        marcadores: [
          { id: 'm1', rotulo: 'D1', x: 100, y: 150, cor: '#ef4444' },
          { id: 'm2', rotulo: 'D2', x: 200, y: 150, cor: '#3b82f6' }
        ]
      },
      {
        id: 'f2',
        nome: 'Abertura',
        ordem: 2,
        duracaoSegundos: 1.5,
        tempoTransicaoEntradaSegundos: 1,
        marcadores: [
          { id: 'm1', rotulo: 'D1', x: 150, y: 50, cor: '#ef4444' },
          { id: 'm2', rotulo: 'D2', x: 150, y: 250, cor: '#3b82f6' }
        ]
      },
      {
        id: 'f3',
        nome: 'Final',
        ordem: 3,
        duracaoSegundos: 3,
        tempoTransicaoEntradaSegundos: 2,
        marcadores: [
          { id: 'm1', rotulo: 'D1', x: 400, y: 150, cor: '#ef4444' },
          { id: 'm2', rotulo: 'D2', x: 500, y: 150, cor: '#3b82f6' }
        ]
      }
    ]
  };

  public formacaoAtivaId: string | null = null;
  public globalMsAtual: number = 0;

  private constructor() {
    this.formacaoAtivaId = this.db.formacoes[0]?.id || null;
  }

  public static getInstance(): AppState {
    if (!AppState.instance) {
      AppState.instance = new AppState();
    }
    return AppState.instance;
  }

  public getFormacaoAtiva() {
    return this.db.formacoes.find(f => f.id === this.formacaoAtivaId);
  }

  public setFormacaoAtiva(id: string) {
    this.formacaoAtivaId = id;
  }
}