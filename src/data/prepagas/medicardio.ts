import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// MEDICARDIO — Abril 2026
// Pricing model: precio por N° de socios (grupos)
// Excepción: Plan Black Plus+ cotiza individualmente por edad
// Promo: Black y Black Plus+ → 15% de por vida con tarjeta de crédito

// Precios por número de socios (1-5, 6+ adiciona por persona)
const POR_SOCIOS: Record<string, Record<number, number>> = {
  azul:     { 1: 17700,  2: 26100,  3: 29300,  4: 36600,  5: 44000  },
  gold:     { 1: 33300,  2: 42100,  3: 54700,  4: 68300,  5: 82200  },
  platinum: { 1: 44000,  2: 60300,  3: 78300,  4: 97900,  5: 117500 },
  black:    { 1: 67800,  2: 127300, 3: 176000, 4: 220100, 5: 264000 },
};

// Incremento por adherente adicional (a partir del 6°)
const ADIC_POR_PERSONA: Record<string, number> = {
  azul:     4200,
  gold:     7700,
  platinum: 11000,
  black:    65000,
};

// Plan Black Plus+ — precio individual por edad
const BLACK_PLUS_POR_EDAD: Record<string, number> = {
  '70+':   197000,
  '50-69': 134100,
  '30-49': 89900,
  '18-29': 65100,
  '<18':   42800,
};

function getTramoBlackPlus(edad: number): string {
  if (edad < 18)  return '<18';
  if (edad <= 29) return '18-29';
  if (edad <= 49) return '30-49';
  if (edad <= 69) return '50-69';
  return '70+';
}

// Cantidad de socios según composición
function nSocios(comp: string): number {
  switch (comp) {
    case 'individual': return 1;
    case 'matrimonio': return 2;
    case 'ind+1':      return 2;
    case 'ind+2':      return 3;
    case 'mat+1':      return 3;
    case 'mat+2':      return 4;
    case 'mat+3':      return 5;
    default:           return 1;
  }
}

function precioNSocios(planId: string, n: number): number | null {
  const tabla = POR_SOCIOS[planId];
  if (!tabla) return null;
  if (n <= 5) return tabla[n] ?? null;
  // 6+ socios: precio del 5° + adicional por cada persona de más
  const base  = tabla[5];
  const adic  = ADIC_POR_PERSONA[planId] ?? 0;
  return base + adic * (n - 5);
}

const planes: Plan[] = [
  {
    id: 'azul', nombre: 'Plan 100 / Azul', nivel: 1,
    descripcion: 'Cobertura básica · Precio por grupo familiar',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'gold', nombre: 'Plan Gold', nivel: 2,
    descripcion: 'Cobertura media · Prestadores ampliados',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'platinum', nombre: 'Plan Platinum', nivel: 3,
    descripcion: 'Cobertura alta · Red extendida de prestadores',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'black', nombre: 'Plan Black', nivel: 4,
    descripcion: 'Cobertura premium · Precio grupal · 15% con TC',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'black_plus', nombre: 'Plan Black Plus+', nivel: 5,
    descripcion: 'Cobertura máxima · Precio individual por edad · 15% con TC',
    tarifas: { con_iva: null, sin_iva: null },
  },
];

export const medicardio: Prepaga = {
  id: 'medicardio',
  nombre: 'MEDICARDIO',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#B71C1C',
  activa: true,
  planes,

  promociones: [
    {
      label: '15% TC de por vida',
      descripcion: '15% de descuento permanente con tarjeta de crédito. Solo aplica en Plan Black y Plan Black Plus+.',
      tipo: 'permanente',
      aplica_planes: ['black', 'black_plus'],
    },
  ],

  getTramo(edad) {
    return getTramoBlackPlus(edad);
  },

  mapComp: {
    individual: 'individual',
    matrimonio: 'matrimonio',
    'ind+1':    'ind+1',
    'ind+2':    'ind+2',
    'mat+1':    'mat+1',
    'mat+2':    'mat+2',
    'mat+3':    'mat+3',
  },

  calcPrecio(plan, edad, compCanonica, _modalidad, _grupo?: GrupoFamiliar): PrecioResult | null {
    if (plan.id === 'black_plus') {
      // Black Plus+: suma individual por edad de cada miembro
      // Solo tenemos la edad del titular → estimamos hijos como <18
      const tramo  = getTramoBlackPlus(edad);
      const pAdult = BLACK_PLUS_POR_EDAD[tramo];
      if (!pAdult) return null;

      let precio: number;
      let nota: string | null = null;

      switch (compCanonica) {
        case 'individual':
          precio = pAdult;
          break;
        case 'matrimonio':
          precio = pAdult * 2;
          nota = 'Matrimonio: ambos adultos al mismo tramo etario del titular.';
          break;
        case 'ind+1':
          precio = pAdult + BLACK_PLUS_POR_EDAD['<18'];
          nota = 'Hijo menor de 18 años.';
          break;
        case 'ind+2':
          precio = pAdult + BLACK_PLUS_POR_EDAD['<18'] * 2;
          nota = 'Hijos menores de 18 años.';
          break;
        case 'mat+1':
          precio = pAdult * 2 + BLACK_PLUS_POR_EDAD['<18'];
          nota = 'Matrimonio mismo tramo + hijo menor de 18.';
          break;
        case 'mat+2':
          precio = pAdult * 2 + BLACK_PLUS_POR_EDAD['<18'] * 2;
          nota = 'Matrimonio mismo tramo + 2 hijos menores de 18.';
          break;
        case 'mat+3':
          precio = pAdult * 2 + BLACK_PLUS_POR_EDAD['<18'] * 3;
          nota = 'Matrimonio mismo tramo + 3 hijos menores de 18.';
          break;
        default:
          return null;
      }

      return {
        precio,
        nota: nota ?? 'Black Plus+: precios individuales por edad. Con TC: 15% de descuento adicional de por vida.',
      };
    }

    // Planes Azul / Gold / Platinum / Black: precio por N° socios
    const n = nSocios(compCanonica);
    const precio = precioNSocios(plan.id, n);
    if (precio == null) return null;

    const nota = plan.id === 'black'
      ? 'Plan Black: con tarjeta de crédito se aplica 15% de descuento de por vida.'
      : null;

    return { precio, nota };
  },
};
