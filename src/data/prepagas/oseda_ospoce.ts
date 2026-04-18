import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// OSEDA / OSPOCE — Superador Recibo — Abril 2026
// Solo Individual, hasta 55 años
// aporte real = salario × 7.65% (fórmula: aporte/3×7.65)
// Solo disponible para relación de dependencia (Superador Recibo)

const planes: Plan[] = [
  {
    id: 'plan800',
    nombre: 'Plan 800',
    nivel: 2,
    descripcion: 'Cobertura media · Individual hasta 55 años · OSEDA/OSPOCE',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'plan900',
    nombre: 'Plan 900',
    nivel: 3,
    descripcion: 'Cobertura completa · Individual hasta 55 años · OSEDA/OSPOCE',
    tarifas: { con_iva: null, sin_iva: null },
  },
];

const PRECIOS: Record<string, number> = {
  plan800: 82800,
  plan900: 99600,
};

export const osedaOspoce: Prepaga = {
  id: 'oseda_ospoce',
  nombre: 'OSEDA / OSPOCE',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#1565C0',
  activa: true,
  planes,
  dep_aporte_pct: 0.0765, // aporte real = salario × 7.65%

  promociones: [],

  getTramo(edad: number): string | null {
    if (edad >= 1 && edad <= 55) return 'hasta55';
    return null;
  },

  mapComp: {
    individual: 'individual',
    matrimonio: null,
    'ind+1':    null,
    'ind+2':    null,
    'mat+1':    null,
    'mat+2':    null,
    'mat+3':    null,
  },

  calcPrecio(plan, edad, compCanonica, modalidad, _grupo?: GrupoFamiliar): PrecioResult | null {
    // Solo disponible para dependencia
    if (modalidad !== 'dependencia') {
      return { precio: null, nota: 'OSEDA/OSPOCE solo disponible para relación de dependencia (Superador Recibo).' };
    }

    // Solo individual
    if (compCanonica !== 'individual') {
      return { precio: null, nota: 'OSEDA/OSPOCE cotiza únicamente Individual. Consultar con asesor para grupos.' };
    }

    // Solo hasta 55 años
    const edadTit = _grupo?.titular ?? edad;
    if (edadTit > 55) {
      return { precio: null, nota: 'OSEDA/OSPOCE acepta hasta 55 años. Consultar con asesor.' };
    }

    const precio = PRECIOS[plan.id];
    if (!precio) return null;

    return {
      precio,
      nota: 'Precio individual hasta 55 años. Solo relación de dependencia.',
    };
  },
};
