import type { Prepaga, Plan, PrecioResult } from '../../types';

const planes: Plan[] = [
  {
    id: 'c100', nombre: 'Plan C-100', nivel: 1,
    descripcion: 'Cobertura básica · Internación y urgencias',
    tarifas: {
      con_iva: {
        '1-29':  { individual: 56382,  matrimonio: 113935, 'mat+1': 140956, 'mat+2': 166625, 'mat+3': 187340 },
        '30-39': { individual: 76287,  matrimonio: 140595, 'mat+1': 171668, 'mat+2': 204093, 'mat+3': 230573 },
        '40-49': { individual: 84670,  matrimonio: 159882, 'mat+1': 194044, 'mat+2': 225176, 'mat+3': 250889 },
        '50-59': { individual: 98629,  matrimonio: 186422, 'mat+1': 225635, 'mat+2': 260256, 'mat+3': 284867 },
      },
      sin_iva: null,
    },
    recargo60_64: { r1: 78609, r2: 46009 },
    mayor65: 'cotiza_central',
  },
  {
    id: 'p200', nombre: 'Plan 200', nivel: 2,
    descripcion: 'Cobertura media · Mayor red prestacional',
    tarifas: {
      con_iva: {
        '1-29':  { individual: 75837,  matrimonio: 153565, 'mat+1': 188961, 'mat+2': 223818, 'mat+3': 252639 },
        '30-39': { individual: 95201,  matrimonio: 176082, 'mat+1': 215351, 'mat+2': 256512, 'mat+3': 290107 },
        '40-49': { individual: 106068, matrimonio: 200197, 'mat+1': 243634, 'mat+2': 283123, 'mat+3': 314897 },
        '50-59': { individual: 125077, matrimonio: 236104, 'mat+1': 286520, 'mat+2': 330417, 'mat+3': 360263 },
      },
      sin_iva: null,
    },
    recargo60_64: { r1: 97160, r2: 60886 },
    mayor65: 'cotiza_central',
  },
  {
    id: 'p300', nombre: 'Plan 300', nivel: 3,
    descripcion: 'Cobertura completa · Sanatorios primera línea',
    tarifas: {
      con_iva: {
        '1-29':  { individual: 110783, matrimonio: 228951, 'mat+1': 260295, 'mat+2': 307760, 'mat+3': 334691 },
        '30-39': { individual: 149692, matrimonio: 257773, 'mat+1': 314966, 'mat+2': 372789, 'mat+3': 406294 },
        '40-49': { individual: 167412, matrimonio: 302683, 'mat+1': 365773, 'mat+2': 417291, 'mat+3': 456780 },
        '50-59': { individual: 205982, matrimonio: 382578, 'mat+1': 457514, 'mat+2': 509951, 'mat+3': 556786 },
      },
      sin_iva: null,
    },
    recargo60_64: { r1: 146474, r2: 128199 },
    mayor65: 'auditoria',
  },
  {
    id: 'p400', nombre: 'Plan 400', nivel: 4,
    descripcion: 'Alta complejidad · Habitación privada',
    tarifas: {
      con_iva: {
        '1-29':  { individual: 128526, matrimonio: 258764, 'mat+1': 315866, 'mat+2': 357748, 'mat+3': 389001 },
        '30-39': { individual: 175001, matrimonio: 301366, 'mat+1': 368106, 'mat+2': 436827, 'mat+3': 475466 },
        '40-49': { individual: 192483, matrimonio: 347773, 'mat+1': 420414, 'mat+2': 479371, 'mat+3': 499758 },
        '50-59': { individual: 231971, matrimonio: 432076, 'mat+1': 516104, 'mat+2': 575612, 'mat+3': 628600 },
      },
      sin_iva: null,
    },
    recargo60_64: { r1: 210115, r2: 198360 },
    mayor65: 'no_cotiza',
  },
  {
    id: 'p500', nombre: 'Plan 500', nivel: 5,
    descripcion: 'Plan premium · Sin tope de internación',
    tarifas: {
      con_iva: {
        '1-29':  { individual: 182567, matrimonio: 367475, 'mat+1': 489426, 'mat+2': 554545, 'mat+3': 602911 },
        '30-39': { individual: 248496, matrimonio: 427910, 'mat+1': 535361, 'mat+2': 677217, 'mat+3': 737022 },
        '40-49': { individual: 273296, matrimonio: 528593, 'mat+1': 651742, 'mat+2': 743116, 'mat+3': 774615 },
        '50-59': { individual: 352549, matrimonio: 670109, 'mat+1': 842572, 'mat+2': 892070, 'mat+3': 974445 },
      },
      sin_iva: null,
    },
    recargo60_64: null,
    mayor65: 'no_cotiza',
  },
];

export const premedic: Prepaga = {
  id: 'premedic',
  nombre: 'PREMEDIC',
  vigencia: 'Febrero 2026',
  zona: 'AMBA',
  color: '#0055A4',
  activa: true,
  planes,

  getTramo(edad) {
    if (edad >= 1  && edad <= 29) return '1-29';
    if (edad >= 30 && edad <= 39) return '30-39';
    if (edad >= 40 && edad <= 49) return '40-49';
    if (edad >= 50 && edad <= 59) return '50-59';
    if (edad >= 60 && edad <= 64) return '60-64';
    if (edad >= 65 && edad <= 70) return '65-70';
    return null;
  },

  mapComp: {
    individual: 'individual',
    matrimonio: 'matrimonio',
    'mat+1':    'mat+1',
    'mat+2':    'mat+2',
    'mat+3':    'mat+3',
    'ind+1':    null,
    'ind+2':    null,
  },

  calcPrecio(plan, edad, compCanonica, _modalidad): PrecioResult | null {
    const tramo = this.getTramo(edad);
    if (!tramo) return null;

    const compKey = this.mapComp[compCanonica];
    if (compKey === null) {
      return { precio: null, nota: 'PREMEDIC no cotiza esta composición sin cónyuge. Consultá con un asesor.' };
    }

    const tabla = plan.tarifas.con_iva;
    if (!tabla) return null;

    if (tramo === '60-64') {
      const base = tabla['50-59'];
      if (!base || !plan.recargo60_64) return { precio: null, nota: 'No cotiza en este tramo' };
      return { precio: base[compKey] + plan.recargo60_64.r1, nota: 'Incluye recargo 60-64. Consultar por cónyuge.' };
    }

    if (tramo === '65-70') {
      if (plan.mayor65 === 'cotiza_central') return { precio: null, nota: 'Cotiza en Central (>65 años)' };
      if (plan.mayor65 === 'auditoria')      return { precio: null, nota: 'Requiere auditoría médica (>65 años)' };
      return { precio: null, nota: 'No disponible (>65 años)' };
    }

    const t = tabla[tramo];
    if (!t) return null;
    return { precio: t[compKey], nota: null };
  },
};
