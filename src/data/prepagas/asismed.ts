import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// Precios individuales por tramo etario — Abril 2026
const IND: Record<string, Record<string, number>> = {
  '0-29':  { bronce: 21600,  plata: 31200,  oro: 46800  },
  '30-35': { bronce: 30096,  plata: 39320,  oro: 58950  },
  '36-45': { bronce: 41448,  plata: 54120,  oro: 81200  },
  '46-55': { bronce: 52852,  plata: 63000,  oro: 94500  },
  '56-60': { bronce: 58476,  plata: 82800,  oro: 140900 },
  '61-65': { bronce: 136620, plata: 171000, oro: 340000 },
  '66-69': { bronce: 191400, plata: 232100, oro: 385000 },
  '70+':   { bronce: 270500, plata: 319400, oro: 561000 },
};

// Tarifas hijos — Solo Grupo Familiar
const PRIMER_HIJO = { bronce: 18000, plata: 24200, oro: 37700 };
const MAS_HIJOS   = { bronce: 17300, plata: 21000, oro: 34000 };

const planes: Plan[] = [
  {
    id: 'bronce', nombre: 'Plan Bronce', nivel: 1,
    descripcion: 'Cobertura básica · Red prestadores ASISMED',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'plata', nombre: 'Plan Plata', nivel: 3,
    descripcion: 'Cobertura media · Prestadores ampliados',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'oro', nombre: 'Plan Oro', nivel: 5,
    descripcion: 'Cobertura premium · Mayor red de prestadores',
    tarifas: { con_iva: null, sin_iva: null },
  },
];

function getTramo(edad: number): string | null {
  if (edad <= 29) return '0-29';
  if (edad <= 35) return '30-35';
  if (edad <= 45) return '36-45';
  if (edad <= 55) return '46-55';
  if (edad <= 60) return '56-60';
  if (edad <= 65) return '61-65';
  if (edad <= 69) return '66-69';
  if (edad >= 70) return '70+';
  return null;
}

export const asismed: Prepaga = {
  id: 'asismed',
  nombre: 'ASISMED',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#1B4F9E',
  activa: true,
  planes,

  promociones: [
    {
      label: '15% 1ª cuota',
      descripcion: '15% de descuento en la primera cuota abonando por transferencia bancaria.',
      tipo: 'primera_cuota',
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

    const k = plan.id as 'bronce' | 'plata' | 'oro';
    const ind = IND[tramo]?.[k];
    if (ind == null) return null;

    let precio: number;
    let nota: string | null = null;

    switch (compCanonica) {
      case 'individual':
        precio = ind;
        break;
      case 'matrimonio':
        precio = ind * 2;
        nota = 'Matrimonio: precio calculado con mismo tramo etario para ambos titulares';
        break;
      case 'ind+1':
        precio = ind + PRIMER_HIJO[k];
        break;
      case 'ind+2':
        precio = ind + PRIMER_HIJO[k] + MAS_HIJOS[k];
        break;
      case 'mat+1':
        precio = ind * 2 + PRIMER_HIJO[k];
        nota = 'Precio calculado con mismo tramo etario para ambos adultos';
        break;
      case 'mat+2':
        precio = ind * 2 + PRIMER_HIJO[k] + MAS_HIJOS[k];
        nota = 'Precio calculado con mismo tramo etario para ambos adultos';
        break;
      case 'mat+3':
        precio = ind * 2 + PRIMER_HIJO[k] + MAS_HIJOS[k] * 2;
        nota = 'Precio calculado con mismo tramo etario para ambos adultos';
        break;
      default:
        return null;
    }

    return { precio, nota };
  },
};
