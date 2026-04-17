import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// PREMEDIC — AMBA — Directos — Abril 2026
// Promociones (solo aplican a planes 200, 300, 400 y 500 — NO al C-100):
//   - Débito TC:                 20% permanente
//   - Débito CBU:                20% permanente
//   - Efectivo / débito / transferencia: 15% permanente
//   - Promo 40% AMBA (TC, 3 meses): 40% por 3 meses, luego descuento permanente

const planes: Plan[] = [
  {
    id: 'c100',
    nombre: 'Plan C-100',
    nivel: 1,
    descripcion: 'Cobertura básica · Internación y urgencias · Sin descuentos de promo',
    tarifas: {
      con_iva: {
        '1-29':  { individual: 59758,  matrimonio: 120757, 'mat+1': 149395, 'mat+2': 177601, 'mat+3': 198556 },
        '30-39': { individual: 80854,  matrimonio: 149013, 'mat+1': 181946, 'mat+2': 216312, 'mat+3': 244377 },
        '40-49': { individual: 89740,  matrimonio: 169454, 'mat+1': 205661, 'mat+2': 238657, 'mat+3': 265910 },
        '50-59': { individual: 104534, matrimonio: 197583, 'mat+1': 239144, 'mat+2': 275838, 'mat+3': 301922 },
      },
      sin_iva: null,
    },
    adicional_3hijos: { con_iva: 166885, sin_iva: 166885 },
  },
  {
    id: 'p200',
    nombre: 'Plan 200',
    nivel: 2,
    descripcion: 'Cobertura media · Mayor red prestacional · Con promos de pago',
    tarifas: {
      con_iva: {
        '1-29':  { individual: 80377,  matrimonio: 162759, 'mat+1': 200275, 'mat+2': 237217, 'mat+3': 267765 },
        '30-39': { individual: 100901, matrimonio: 186624, 'mat+1': 228244, 'mat+2': 271869, 'mat+3': 307476 },
        '40-49': { individual: 112418, matrimonio: 212183, 'mat+1': 258221, 'mat+2': 300073, 'mat+3': 333750 },
        '50-59': { individual: 132566, matrimonio: 250239, 'mat+1': 303674, 'mat+2': 350199, 'mat+3': 381832 },
      },
      sin_iva: null,
    },
    adicional_3hijos: { con_iva: 166885, sin_iva: 166885 },
  },
  {
    id: 'p300',
    nombre: 'Plan 300',
    nivel: 3,
    descripcion: 'Cobertura completa · Sanatorios primera línea · Con promos de pago',
    tarifas: {
      con_iva: {
        '1-29':  { individual: 117415, matrimonio: 242659, 'mat+1': 275879, 'mat+2': 326186, 'mat+3': 354728 },
        '30-39': { individual: 158654, matrimonio: 273206, 'mat+1': 333823, 'mat+2': 395108, 'mat+3': 430619 },
        '40-49': { individual: 177435, matrimonio: 320805, 'mat+1': 387671, 'mat+2': 442274, 'mat+3': 484127 },
        '50-59': { individual: 218315, matrimonio: 405483, 'mat+1': 484906, 'mat+2': 540482, 'mat+3': 590121 },
      },
      sin_iva: null,
    },
    adicional_3hijos: { con_iva: 187528, sin_iva: 187528 },
  },
  {
    id: 'p400',
    nombre: 'Plan 400',
    nivel: 4,
    descripcion: 'Alta complejidad · Habitación privada · Con promos de pago',
    tarifas: {
      con_iva: {
        '1-29':  { individual: 136221, matrimonio: 274256, 'mat+1': 334777, 'mat+2': 379166, 'mat+3': 412291 },
        '30-39': { individual: 185478, matrimonio: 319408, 'mat+1': 390144, 'mat+2': 462980, 'mat+3': 503932 },
        '40-49': { individual: 204007, matrimonio: 368594, 'mat+1': 445584, 'mat+2': 508070, 'mat+3': 529678 },
        '50-59': { individual: 245859, matrimonio: 457945, 'mat+1': 547003, 'mat+2': 610074, 'mat+3': 666234 },
      },
      sin_iva: null,
    },
    adicional_3hijos: { con_iva: 225012, sin_iva: 225012 },
  },
  {
    id: 'p500',
    nombre: 'Plan 500',
    nivel: 5,
    descripcion: 'Plan premium · Sin tope de internación · Con promos de pago',
    tarifas: {
      con_iva: {
        '1-29':  { individual: 193497, matrimonio: 389476, 'mat+1': 518728, 'mat+2': 587746, 'mat+3': 639008 },
        '30-39': { individual: 263373, matrimonio: 453529, 'mat+1': 567413, 'mat+2': 717762, 'mat+3': 781147 },
        '40-49': { individual: 289659, matrimonio: 560240, 'mat+1': 690762, 'mat+2': 787607, 'mat+3': 820991 },
        '50-59': { individual: 373656, matrimonio: 710228, 'mat+1': 893017, 'mat+2': 945478, 'mat+3': 1032785 },
      },
      sin_iva: null,
    },
    adicional_3hijos: { con_iva: 325513, sin_iva: 325513 },
  },
];

const PLANES_CON_PROMO = new Set(['p200', 'p300', 'p400', 'p500']);

export const premedic: Prepaga = {
  id: 'premedic',
  nombre: 'PREMEDIC',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#0A5C9A',
  activa: true,
  planes,

  promociones: [
    {
      label: '20% débito TC/CBU',
      descripcion: 'Planes 200-500: 20% de descuento permanente abonando con débito en tarjeta de crédito o CBU.',
      tipo: 'permanente',
      aplica_planes: ['p200', 'p300', 'p400', 'p500'],
    },
    {
      label: '15% efectivo/transferencia',
      descripcion: 'Planes 200-500: 15% de descuento permanente abonando en efectivo, débito o transferencia.',
      tipo: 'permanente',
      aplica_planes: ['p200', 'p300', 'p400', 'p500'],
    },
    {
      label: '40% promo lanzamiento (3 meses)',
      descripcion: 'Planes 200-500 (AMBA): 40% de descuento por 3 meses abonando con débito en tarjeta de crédito.',
      tipo: 'temporal',
      duracion_meses: 3,
      aplica_planes: ['p200', 'p300', 'p400', 'p500'],
    },
  ],

  getTramo(edad) {
    if (edad >=  1 && edad <= 29) return '1-29';
    if (edad >= 30 && edad <= 39) return '30-39';
    if (edad >= 40 && edad <= 49) return '40-49';
    if (edad >= 50 && edad <= 59) return '50-59';
    if (edad >= 60 && edad <= 64) return '60-64';
    if (edad >= 65)               return '65+';
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

  calcPrecio(plan, edad, compCanonica, _modalidad, _grupo?: GrupoFamiliar): PrecioResult | null {
    const tramo = this.getTramo(edad);
    if (!tramo) return null;

    if (compCanonica === 'ind+1' || compCanonica === 'ind+2') {
      return { precio: null, nota: 'PREMEDIC cotiza grupos con cónyuge. Consultar composición sin pareja.' };
    }

    if (tramo === '60-64' || tramo === '65+') {
      return { precio: null, nota: 'Para mayores de 60 años, el precio varía. Consultar con asesor PREMEDIC.' };
    }

    const tabla = plan.tarifas.con_iva;
    if (!tabla) return null;

    const fila = tabla[tramo];
    if (!fila) return null;

    const precio = fila[compCanonica];
    if (precio == null) return null;

    const tienePromo = PLANES_CON_PROMO.has(plan.id);
    const nota = tienePromo
      ? 'Con débito TC/CBU: 20% off permanente. Transferencia: 15% off. Promo 40% primeros 3 meses con TC.'
      : 'Plan C-100 sin descuentos especiales.';

    return { precio, nota };
  },
};
