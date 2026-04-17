import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// FORMED Medicina Integral — Abril 2026
// Precios Lista (individuales por edad)
// Descuentos:
//   - Con débito TC (Visa/Mastercard): 20% de por vida
//   - Sin débito TC → Con transferencia/débito bancario:
//       20% meses 1-6, luego 10% meses 7-12, luego precio lista
//   - Primer pago SIEMPRE por transferencia

const LISTA: Record<string, Record<string, number>> = {
  '01-17': { fs300: 82920,  fs1000: 112984 },
  '18-25': { fs300: 99924,  fs1000: 124722 },
  '26-35': { fs300: 121495, fs1000: 177547 },
  '36-45': { fs300: 164341, fs1000: 223033 },
  '46-55': { fs300: 193981, fs1000: 277324 },
  '56-60': { fs300: 245419, fs1000: 332057 },
  '61-65': { fs300: 413386, fs1000: 556514 },
  '66-70': { fs300: 475500, fs1000: 0 },      // FS1000 no disponible en 66-70
};

const planes: Plan[] = [
  {
    id: 'fs300', nombre: 'Plan FS300', nivel: 2,
    descripcion: 'Cobertura básica · Red FORMED · Individual por edad',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'fs1000', nombre: 'Plan FS1000', nivel: 4,
    descripcion: 'Cobertura completa · Red ampliada · Individual por edad',
    tarifas: { con_iva: null, sin_iva: null },
  },
];

function getTramo(edad: number): string | null {
  if (edad >=  1 && edad <= 17) return '01-17';
  if (edad >= 18 && edad <= 25) return '18-25';
  if (edad >= 26 && edad <= 35) return '26-35';
  if (edad >= 36 && edad <= 45) return '36-45';
  if (edad >= 46 && edad <= 55) return '46-55';
  if (edad >= 56 && edad <= 60) return '56-60';
  if (edad >= 61 && edad <= 65) return '61-65';
  if (edad >= 66 && edad <= 70) return '66-70';
  return null;
}

export const formed: Prepaga = {
  id: 'formed',
  nombre: 'FORMED',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#2E7D32',
  activa: true,
  planes,

  promociones: [
    {
      label: '20% TC Visa/MC de por vida',
      descripcion: '20% de descuento permanente adhiriendo débito automático en tarjeta de crédito Visa o Mastercard.',
      tipo: 'permanente',
    },
    {
      label: '20% meses 1-6 (sin TC)',
      descripcion: 'Sin tarjeta de crédito: 20% de descuento del 1° al 6° mes por transferencia o débito bancario.',
      tipo: 'temporal',
      duracion_meses: 6,
    },
    {
      label: '10% meses 7-12 (sin TC)',
      descripcion: 'Sin tarjeta de crédito: 10% de descuento del 7° al 12° mes.',
      tipo: 'temporal',
      duracion_meses: 6,
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
    const edadTit = grupo?.titular ?? edad;
    const tramo = this.getTramo(edadTit);
    if (!tramo) return null;

    const listaTit = LISTA[tramo]?.[plan.id];
    if (!listaTit || listaTit === 0) {
      if (plan.id === 'fs1000' && tramo === '66-70') {
        return { precio: null, nota: 'FS1000 no disponible para 66-70 años. Consultar asesor.' };
      }
      return null;
    }

    function precioMiembro(e: number): number {
      const t = getTramo(e) ?? '18-25';
      return LISTA[t]?.[plan.id] || listaTit;
    }

    let precio: number;
    let nota: string | null = null;
    const conEdades = !!grupo;

    switch (compCanonica) {
      case 'individual':
        precio = listaTit;
        break;
      case 'matrimonio': {
        const pConj = grupo?.conyuge ? precioMiembro(grupo.conyuge) : listaTit;
        precio = listaTit + pConj;
        if (!grupo?.conyuge) nota = 'Edad del cónyuge no ingresada · usando tramo del titular.';
        break;
      }
      case 'ind+1':
      case 'mat+1': {
        const adultos = compCanonica === 'mat+1' ? 2 : 1;
        const pConj   = adultos === 2 ? (grupo?.conyuge ? precioMiembro(grupo.conyuge) : listaTit) : 0;
        const hijoEdad = grupo?.hijos[0];
        const pHijo = hijoEdad ? precioMiembro(hijoEdad) : (LISTA['01-17']?.[plan.id] ?? listaTit);
        precio = listaTit + pConj + pHijo;
        if (!conEdades) nota = 'Hijo cotizado al tramo 01-17. Ingresá la edad exacta para mayor precisión.';
        break;
      }
      case 'ind+2':
      case 'mat+2': {
        const adultos = compCanonica === 'mat+2' ? 2 : 1;
        const pConj   = adultos === 2 ? (grupo?.conyuge ? precioMiembro(grupo.conyuge) : listaTit) : 0;
        const p1 = grupo?.hijos[0] ? precioMiembro(grupo.hijos[0]) : (LISTA['01-17']?.[plan.id] ?? listaTit);
        const p2 = grupo?.hijos[1] ? precioMiembro(grupo.hijos[1]) : (LISTA['01-17']?.[plan.id] ?? listaTit);
        precio = listaTit + pConj + p1 + p2;
        if (!conEdades) nota = 'Hijos cotizados al tramo 01-17. Ingresá las edades para mayor precisión.';
        break;
      }
      case 'mat+3': {
        const pConj = grupo?.conyuge ? precioMiembro(grupo.conyuge) : listaTit;
        const p1 = grupo?.hijos[0] ? precioMiembro(grupo.hijos[0]) : (LISTA['01-17']?.[plan.id] ?? listaTit);
        const p2 = grupo?.hijos[1] ? precioMiembro(grupo.hijos[1]) : (LISTA['01-17']?.[plan.id] ?? listaTit);
        const p3 = grupo?.hijos[2] ? precioMiembro(grupo.hijos[2]) : (LISTA['01-17']?.[plan.id] ?? listaTit);
        precio = listaTit + pConj + p1 + p2 + p3;
        if (!conEdades) nota = 'Hijos cotizados al tramo 01-17. Ingresá las edades para mayor precisión.';
        break;
      }
      default:
        return null;
    }

    return { precio: Math.round(precio), nota };
  },
};
