import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// SALUD CENTRAL — Abril 2026
// Precios individuales por edad
// Hijos hasta 18 años (17 años y 11 meses)
// SC-30 NO cubre Plan Materno
// Promo: 10% débito automático Visa/Mastercard (mientras se mantenga)

const LISTA: Record<string, Record<string, number>> = {
  'sc30':  {
    '18-29': 61413,  '30-35': 79413,  '36-40': 84707,
    '41-50': 116473, '51-60': 177885, '61-65': 257298,
    '66-70': 307064, '71-75': 386477, '76-79': 524126, '80-85': 794131,
  },
  'sc50':  {
    '18-29': 74119,  '30-35': 90001,  '36-40': 124943,
    '41-50': 132355, '51-60': 209651, '61-65': 312358,
    '66-70': 369536, '71-75': 508244, '76-79': 698835,
  },
  'sc70':  {
    '18-29': 90001,  '30-35': 115414, '36-40': 137649,
    '41-50': 164120, '51-60': 256240, '61-65': 398124,
    '66-70': 476478, '71-75': 651187,
  },
  'sc90':  {
    '18-29': 100590, '30-35': 127061, '36-40': 184238,
    '41-50': 211768, '51-60': 295417, '61-65': 471184,
    '66-70': 561186, '71-75': 698835, '76-79': 847073,
  },
  'sc110': {
    '18-29': 116473, '30-35': 142944, '36-40': 222357,
    '41-50': 243533, '51-60': 337240, '61-65': 580245,
    '66-70': 677658, '71-75': 815308,
  },
};

// Tarifas hijos (Primer Hijo / Segundo Hijo en adelante)
const HIJOS: Record<string, { primer: number; segundo: number }> = {
  sc30:  { primer: 52942,  segundo: 47648  },
  sc50:  { primer: 63530,  segundo: 58236  },
  sc70:  { primer: 79413,  segundo: 74119  },
  sc90:  { primer: 90001,  segundo: 84707  },
  sc110: { primer: 105884, segundo: 95295  },
};

function getTramo(edad: number): string | null {
  if (edad >= 18 && edad <= 29) return '18-29';
  if (edad >= 30 && edad <= 35) return '30-35';
  if (edad >= 36 && edad <= 40) return '36-40';
  if (edad >= 41 && edad <= 50) return '41-50';
  if (edad >= 51 && edad <= 60) return '51-60';
  if (edad >= 61 && edad <= 65) return '61-65';
  if (edad >= 66 && edad <= 70) return '66-70';
  if (edad >= 71 && edad <= 75) return '71-75';
  if (edad >= 76 && edad <= 79) return '76-79';
  if (edad >= 80 && edad <= 85) return '80-85';
  return null;
}

const planes: Plan[] = [
  {
    id: 'sc30',  nombre: 'Plan SC-30', nivel: 1,
    descripcion: 'Cobertura básica · Sin Plan Materno',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'sc50',  nombre: 'Plan SC-50', nivel: 2,
    descripcion: 'Cobertura media',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'sc70',  nombre: 'Plan SC-70', nivel: 3,
    descripcion: 'Cobertura completa',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'sc90',  nombre: 'Plan SC-90', nivel: 4,
    descripcion: 'Cobertura alta · Red extendida',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'sc110', nombre: 'Plan SC-110', nivel: 5,
    descripcion: 'Cobertura premium · Sin tope de internación',
    tarifas: { con_iva: null, sin_iva: null },
  },
];

export const saludCentral: Prepaga = {
  id: 'salud_central',
  nombre: 'SALUD CENTRAL',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#00695C',
  activa: true,
  planes,

  promociones: [
    {
      label: '10% débito automático',
      descripcion: '10% de descuento mientras se mantenga el débito automático con tarjeta Visa o Mastercard (crédito o débito).',
      tipo: 'permanente',
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

  calcPrecio(plan, edad, compCanonica, _modalidad, _grupo?: GrupoFamiliar): PrecioResult | null {
    const tramo = this.getTramo(edad);
    if (!tramo) return null;

    const k = plan.id;
    const precioInd = LISTA[k]?.[tramo];
    if (precioInd == null) {
      return { precio: null, nota: `${plan.nombre} no disponible para este rango etario. Consultar asesor.` };
    }

    const hijos = HIJOS[k];
    let precio: number;
    let nota: string | null = 'Con débito automático Visa/MC: 10% de descuento adicional.';

    switch (compCanonica) {
      case 'individual':
        precio = precioInd;
        break;
      case 'matrimonio':
        precio = precioInd * 2;
        nota = 'Matrimonio: mismo tramo etario para ambos adultos. Con débito automático: 10% off.';
        break;
      case 'ind+1':
        precio = precioInd + hijos.primer;
        break;
      case 'ind+2':
        precio = precioInd + hijos.primer + hijos.segundo;
        break;
      case 'mat+1':
        precio = precioInd * 2 + hijos.primer;
        nota = 'Matrimonio mismo tramo + 1 hijo. Con débito automático: 10% off.';
        break;
      case 'mat+2':
        precio = precioInd * 2 + hijos.primer + hijos.segundo;
        nota = 'Matrimonio mismo tramo + 2 hijos. Con débito automático: 10% off.';
        break;
      case 'mat+3':
        precio = precioInd * 2 + hijos.primer + hijos.segundo * 2;
        nota = 'Matrimonio mismo tramo + 3 hijos. Con débito automático: 10% off.';
        break;
      default:
        return null;
    }

    return { precio: Math.round(precio), nota };
  },
};
