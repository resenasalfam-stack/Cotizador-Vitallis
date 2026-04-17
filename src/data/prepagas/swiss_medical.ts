import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// SWISS MEDICAL — Directos AMBA — Abril 2026 (precios con IVA)
// Promos (aplicar manualmente con calculadora según indica el PDF):
//   - Menores de 26 años: 50% de descuento por 1 año
//   - 26 a 64 años:       15% de descuento por 1 año

const LISTA: Record<string, Record<string, number>> = {
  's2':    { 'hasta35': 219841, '36-40': 263802, '41-45': 276975, '46-50': 304699, '51-55': 396105, '56-60': 514928, '61+': 648531 },
  'smg20': { 'hasta35': 306788, '36-40': 368135, '41-45': 386518, '46-50': 425207, '51-55': 552764, '56-60': 718582, '61+': 905025 },
  'smg30': { 'hasta35': 352424, '36-40': 422909, '41-45': 444071, '46-50': 488478, '51-55': 635005, '56-60': 825512, '61+': 1039652 },
  'smg50': { 'hasta35': 460262, '36-40': 552283, '41-45': 579910, '46-50': 637891, '51-55': 829252, '56-60': 1078060, '61+': 1357774 },
};

// Tarifas hijos
const HIJOS: Record<string, { primer: number; adicional: number }> = {
  s2:    { primer: 185837, adicional: 133375 },
  smg20: { primer: 259335, adicional: 186125 },
  smg30: { primer: 301712, adicional: 216317 },
  smg50: { primer: 342378, adicional: 244800 },
};

function getTramo(edad: number): string | null {
  if (edad <= 35) return 'hasta35';
  if (edad <= 40) return '36-40';
  if (edad <= 45) return '41-45';
  if (edad <= 50) return '46-50';
  if (edad <= 55) return '51-55';
  if (edad <= 60) return '56-60';
  if (edad >= 61) return '61+';
  return null;
}

const planes: Plan[] = [
  {
    id: 's2', nombre: 'Plan S2', nivel: 1,
    descripcion: 'Con copagos · Directos AMBA · Precio con IVA',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'smg20', nombre: 'Plan SMG20', nivel: 2,
    descripcion: 'Sin copagos · Red SMG · Precio con IVA',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'smg30', nombre: 'Plan SMG30', nivel: 3,
    descripcion: 'Sin copagos · Red SMG ampliada · Precio con IVA',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'smg50', nombre: 'Plan SMG50', nivel: 5,
    descripcion: 'Sin copagos + Cirugía Estética · Premium · Precio con IVA',
    tarifas: { con_iva: null, sin_iva: null },
  },
];

export const swissMedical: Prepaga = {
  id: 'swiss_medical',
  nombre: 'SWISS MEDICAL',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#C8102E',
  activa: true,
  planes,

  promociones: [
    {
      label: '50% menores de 26 años (1 año)',
      descripcion: '50% de descuento durante 1 año para afiliados menores de 26 años.',
      tipo: 'temporal',
      duracion_meses: 12,
    },
    {
      label: '15% entre 26 y 64 años (1 año)',
      descripcion: '15% de descuento durante 1 año para afiliados de 26 a 64 años.',
      tipo: 'temporal',
      duracion_meses: 12,
    },
  ],

  getTramo,

  mapComp: {
    individual: 'individual',
    matrimonio: 'matrimonio',
    'ind+1':    'ind+1',
    'ind+2':    'ind+2',
    'mat+1':    'mat+1',
    'mat+2':    'mat+2',
    'mat+3':    'mat+3',
  },

  calcPrecio(plan, edad, compCanonica, _modalidad, grupo?: GrupoFamiliar): PrecioResult | null {
    const k = plan.id;
    const hijos = HIJOS[k];

    function promoLabel(e: number): string {
      if (e < 26)  return `${e}a: 50% desc. 1er año`;
      if (e <= 64) return `${e}a: 15% desc. 1er año`;
      return '';
    }

    // Precio del titular
    const edadTit = grupo?.titular ?? edad;
    const tramoTit = this.getTramo(edadTit);
    if (!tramoTit) return null;
    const precioTit = LISTA[k]?.[tramoTit];
    if (precioTit == null) return null;

    // Precio del cónyuge (si aplica)
    let precioConyuge = precioTit; // fallback a titular si no se ingresó edad
    if (grupo?.conyuge) {
      const tramoConj = this.getTramo(grupo.conyuge);
      if (!tramoConj) return null;
      precioConyuge = LISTA[k]?.[tramoConj] ?? precioTit;
    }

    let precio: number;
    switch (compCanonica) {
      case 'individual': precio = precioTit; break;
      case 'matrimonio': precio = precioTit + precioConyuge; break;
      case 'ind+1':  precio = precioTit + hijos.primer; break;
      case 'ind+2':  precio = precioTit + hijos.primer + hijos.adicional; break;
      case 'mat+1':  precio = precioTit + precioConyuge + hijos.primer; break;
      case 'mat+2':  precio = precioTit + precioConyuge + hijos.primer + hijos.adicional; break;
      case 'mat+3':  precio = precioTit + precioConyuge + hijos.primer + hijos.adicional * 2; break;
      default: return null;
    }

    // Construir nota de promos
    const promos: string[] = [];
    const notaTit = promoLabel(edadTit);
    if (notaTit) promos.push(`Titular: ${notaTit}`);
    if (grupo?.conyuge) {
      const notaConj = promoLabel(grupo.conyuge);
      if (notaConj) promos.push(`Cónyuge: ${notaConj}`);
    }
    if (grupo?.hijos.length) {
      grupo.hijos.forEach((he, i) => {
        const n = promoLabel(he);
        if (n) promos.push(`Hijo ${i + 1}: ${n}`);
      });
    }
    if (!promos.length) {
      const notaTitFallback = promoLabel(edadTit);
      promos.push(notaTitFallback || 'Sin promo etaria (65+). Consultar descuentos.');
    }

    return {
      precio: Math.round(precio),
      nota: promos.join(' · '),
    };
  },
};
