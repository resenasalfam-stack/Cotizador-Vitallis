import { CFG, CATEGORIAS_MONO, GHL_WEBHOOK } from '../data/config';
import type { LeadData } from '../types';

/** Formatea número como precio en pesos argentinos */
export const fp = (n: number | null | undefined): string =>
  n != null ? `$${Math.round(n).toLocaleString('es-AR')}` : '—';

/** Calcula el aporte mensual según modalidad laboral */
export function calcularAporte(mod: string, salario: number, comp: string, categoriaMono?: string): number {
  if (mod === 'particular') return 0;

  if (mod === 'dependencia') {
    return Math.round(salario * (CFG.dep_empleado + CFG.dep_empleador));
  }

  if (mod === 'monotributo') {
    const adherentes: Record<string, number> = {
      individual: 0,
      matrimonio: 1,
      'ind+1':    1,
      'ind+2':    2,
      'mat+1':    2,
      'mat+2':    3,
      'mat+3':    4,
    };
    const cat = CATEGORIAS_MONO.find(c => c.key === categoriaMono);
    const aporteBase = cat ? cat.aporteObraSocial : CFG.mono_titular;
    return aporteBase * (1 + (adherentes[comp] ?? 0));
  }

  return 0;
}

/** Envía lead a GoHighLevel via webhook */
export async function enviarLead(data: LeadData): Promise<{ ok: boolean; error?: string }> {
  if (!GHL_WEBHOOK) {
    console.warn('GHL_WEBHOOK no configurado. Completar VITE_GHL_WEBHOOK en .env');
    return { ok: false, error: 'Webhook no configurado' };
  }

  try {
    const res = await fetch(GHL_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { ok: true };
  } catch (e) {
    console.error('Error enviando lead a GHL:', e);
    return { ok: false, error: String(e) };
  }
}
