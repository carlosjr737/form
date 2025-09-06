import type { Formacao } from '../types';

export class TimelineUtils {
  public static getTimelineTotalSegundos(formacoes: Formacao[], audioDuration: number = 0): number {
    const formacoesTotal = formacoes.reduce((acc, f) => acc + f.duracaoSegundos + f.tempoTransicaoEntradaSegundos, 0);
    return Math.max(formacoesTotal, audioDuration, 1);
  }

  public static getTimelineTotalMs(formacoes: Formacao[], audioDuration: number = 0): number {
    return this.getTimelineTotalSegundos(formacoes, audioDuration) * 1000;
  }

  public static calcularTempoAcumuladoAteFormacao(idx: number, formacoes: Formacao[]): number {
    let t = 0;
    for (let i = 0; i < idx; i++) {
      t += formacoes[i].tempoTransicaoEntradaSegundos + formacoes[i].duracaoSegundos;
    }
    if (formacoes[idx]) {
      t += formacoes[idx].tempoTransicaoEntradaSegundos;
    }
    return t * 1000;
  }

  public static formatarTempo(seg: number): string {
    if (seg >= 60) {
      const m = Math.floor(seg / 60);
      const s = Math.round(seg - m * 60);
      return `${m}:${String(s).padStart(2, '0')}`;
    }
    return seg < 10 ? seg.toFixed(1) + 's' : Math.round(seg) + 's';
  }

  public static escolherStep(total: number, width: number): number {
    const alvoTicks = Math.max(8, Math.min(12, Math.floor(width / 120)));
    const bruto = total / Math.max(1, alvoTicks);
    const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300, 600];
    
    for (const s of steps) {
      if (s >= bruto) return s;
    }
    return Math.ceil(bruto);
  }

  public static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}