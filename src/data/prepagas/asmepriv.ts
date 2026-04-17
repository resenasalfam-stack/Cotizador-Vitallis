import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// Precios Lista (con IVA) — ASMEPRIV Directos Abril 2026
// Composiciones: ind = Individual Sin Maternidad, ind1/ind2 = Ind c/Hijos,
//                mat = Matrimonio, mat1/mat2/mat3 = Matrimonio c/Hijos
// On Demand ≈ 30% menos que Lista — se muestra como promo en el card

type CompKey = 'ind' | 'ind1' | 'ind2' | 'mat' | 'mat1' | 'mat2' | 'mat3';
type TramoKey = '18-29' | '30-39' | '40-49' | '50-59' | '60-64' | '65-69' | '70-71';

type TablaLista = Record<TramoKey, Partial<Record<CompKey, number>>>;

const HM: TablaLista = {
  '18-29': { ind: 146733, ind1: 213492, ind2: 263406, mat: 249447, mat1: 316206, mat2: 366119, mat3: 399811 },
  '30-39': { ind: 160723, ind1: 227482, ind2: 277395, mat: 273228, mat1: 339988, mat2: 389901, mat3: 423593 },
  '40-49': { ind: 175596, ind1: 242355, ind2: 292268, mat: 302923, mat1: 374052, mat2: 423965, mat3: 457657 },
  '50-59': { ind: 211334, ind1: 278093, ind2: 328006, mat: 380400, mat1: 447160, mat2: 497073, mat3: 530765 },
  '60-64': { ind: 315498, mat: 563389 },
  '65-69': { ind: 469469, mat: 855560 },
  '70-71': { ind: 489395, mat: 906765 },
};

const AS100: TablaLista = {
  '18-29': { ind: 168582, ind1: 248444, ind2: 308340, mat: 279961, mat1: 359822, mat2: 419718, mat3: 459649 },
  '30-39': { ind: 185431, ind1: 265292, ind2: 325188, mat: 322437, mat1: 402298, mat2: 462194, mat3: 502125 },
  '40-49': { ind: 211390, ind1: 291252, ind2: 351148, mat: 380646, mat1: 460507, mat2: 520404, mat3: 560334 },
  '50-59': { ind: 264532, ind1: 344393, ind2: 404290, mat: 502611, mat1: 582472, mat2: 642368, mat3: 682299 },
  '60-64': { ind: 349426, mat: 663909 },
  '65-69': { ind: 492586, mat: 965188 },
  '70-71': { ind: 544735, mat: 1067365 },
};

const AS105: TablaLista = {
  '18-29': { ind: 172280, ind1: 269611, ind2: 342609, mat: 310103, mat1: 407434, mat2: 480433, mat3: 529098 },
  '30-39': { ind: 205728, ind1: 303059, ind2: 376058, mat: 366196, mat1: 463527, mat2: 536525, mat3: 610000 },
  '40-49': { ind: 229786, ind1: 327117, ind2: 400115, mat: 427402, mat1: 524733, mat2: 597731, mat3: 646397 },
  '50-59': { ind: 297358, ind1: 394689, ind2: 467688, mat: 564981, mat1: 662312, mat2: 735310, mat3: 783976 },
  '60-64': { ind: 433679, mat: 823991 },
  '65-69': { ind: 0, mat: 0 }, // No cotiza en 65-69 para AS105
  '70-71': { ind: 0, mat: 0 },
};

const TABLAS: Record<string, TablaLista> = { hm: HM, as100: AS100, as105: AS105 };

const planes: Plan[] = [
  {
    id: 'hm', nombre: 'Plan HM', nivel: 2,
    descripcion: 'Cobertura hospitalaria media · Red ASMEPRIV',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'as100', nombre: 'Plan AS100', nivel: 3,
    descripcion: 'Cobertura completa · Internación y ambulatorio',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'as105', nombre: 'Plan AS105', nivel: 4,
    descripcion: 'Cobertura premium · Sin tope de internación',
    tarifas: { con_iva: null, sin_iva: null },
  },
];

function getTramo(edad: number): TramoKey | null {
  if (edad >= 18 && edad <= 29) return '18-29';
  if (edad >= 30 && edad <= 39) return '30-39';
  if (edad >= 40 && edad <= 49) return '40-49';
  if (edad >= 50 && edad <= 59) return '50-59';
  if (edad >= 60 && edad <= 64) return '60-64';
  if (edad >= 65 && edad <= 69) return '65-69';
  if (edad >= 70 && edad <= 71) return '70-71';
  return null;
}

const MAP_COMP: Record<string, CompKey | null> = {
  individual: 'ind',
  matrimonio: 'mat',
  'ind+1':    'ind1',
  'ind+2':    'ind2',
  'mat+1':    'mat1',
  'mat+2':    'mat2',
  'mat+3':    'mat3',
};

export const asmepriv: Prepaga = {
  id: 'asmepriv',
  nombre: 'ASMEPRIV',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#D45500',
  activa: true,
  planes,

  promociones: [
    {
      label: '30% On Demand',
      descripcion: 'Precio On Demand: ~30% menos que Lista. Aplica con cualquier medio de pago.',
      tipo: 'permanente',
    },
    {
      label: '10% TC meses 1-6',
      descripcion: 'Promo Extra: 10% de descuento del 1° al 6° mes con tarjeta de crédito.',
      tipo: 'temporal',
      duracion_meses: 6,
    },
    {
      label: '5% TC mes 7+',
      descripcion: 'Promo Extra: 5% de descuento desde el 7° mes en adelante con tarjeta de crédito.',
      tipo: 'permanente',
    },
  ],

  getTramo,

  mapComp: {
    individual: 'ind',
    matrimonio: 'mat',
    'ind+1':    'ind1',
    'ind+2':    'ind2',
    'mat+1':    'mat1',
    'mat+2':    'mat2',
    'mat+3':    'mat3',
  },

  calcPrecio(plan, edad, compCanonica, _modalidad, _grupo?: GrupoFamiliar): PrecioResult | null {
    const tramo = this.getTramo(edad);
    if (!tramo) return null;

    const tabla = TABLAS[plan.id];
    if (!tabla) return null;

    const compKey = MAP_COMP[compCanonica];
    if (compKey === undefined) return null;
    if (compKey === null) return { precio: null, nota: 'No aplica esta composición en ASMEPRIV' };

    const filaTramo = tabla[tramo];
    if (!filaTramo) return null;

    // Tramos avanzados solo tienen ind/mat
    if ((tramo === '60-64' || tramo === '65-69' || tramo === '70-71') &&
        (compKey === 'ind1' || compKey === 'ind2' || compKey === 'mat1' || compKey === 'mat2' || compKey === 'mat3')) {
      return { precio: null, nota: 'Para este tramo etario, ASMEPRIV solo cotiza Individual y Matrimonio. Consultar con asesor.' };
    }

    const precio = filaTramo[compKey];
    if (precio == null || precio === 0) return { precio: null, nota: 'No disponible en este tramo. Consultar con asesor.' };

    return {
      precio,
      nota: 'Precio Lista. On Demand disponible (~30% menos) con cualquier medio de pago.',
    };
  },
};
