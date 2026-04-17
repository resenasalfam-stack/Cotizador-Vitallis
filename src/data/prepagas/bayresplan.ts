import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// BAYRESPLAN — Abril 2026
// Promoción obligatoria: 35% con tarjeta bancaria (Visa/MC/Amex) por 6 meses renovables
// Alternativa: 25% con transferencia / MercadoPago / Pago Fácil / RapiPago
// Los precios almacenados son CON la promo del 35% (tarjeta bancaria)
// Para pago sin tarjeta: precio / 0.65 * 0.75 (ó precio * 1.538 * 0.75)

// Estructura: [tramo][comp] = precio con 35% off
// comps: ind, mat, mat_h (matrimonio+hijo), h25 (adic. hijo h/25), ind_h (ind+hijo), adic18 (adic 18-49)

const ABIERTO_0_49 = {
  ind:   81894,
  mat:   130884,
  mat_h: 153732,
  h25:   25129,
  ind_h: 104111,
};

const ABIERTO_50_59 = {
  ind:    100308,
  mat:    187317,
  mat_h:  207246,
  h25:    25129,
  ind_h:  121232,
  adic18: 77129,
};

const JOVEN_ABIERTO_18_29 = {
  ind: 56511,
};

const CERRADO_0_49 = {
  ind:   64227,
  mat:   103110,
  mat_h: 121017,
  h25:   19331,
  ind_h: 81718,
};

const CERRADO_50_59 = {
  ind:    78845,
  mat:    148571,
  mat_h:  162175,
  h25:    19494,
  ind_h:  94062,
  adic18: 58994,
};

const JOVEN_CERRADO_18_29 = {
  ind: 43453,
};

const COMPL_ABIERTO_0_49 = {
  ind:   33384,
  mat:   56752,
  mat_h: 76024,
  h25:   20553,
  ind_h: 52163,
};

const COMPL_ABIERTO_50_59 = {
  ind:    42036,
  mat:    75498,
  mat_h:  95544,
  h25:    20794,
  ind_h:  50869,
  adic18: 31064,
};

const COMPL_CERRADO_0_49 = {
  ind:   28894,
  mat:   48815,
  mat_h: 65330,
  h25:   15704,
  ind_h: 44985,
};

const COMPL_CERRADO_50_59 = {
  ind:    34138,
  mat:    62251,
  mat_h:  78958,
  h25:    19494,
  ind_h:  50869,
  adic18: 27157,
};

// Calcula el precio para una composición dada usando las tarifas del tramo
function calcComp(
  tramo: typeof ABIERTO_0_49 & { adic18?: number },
  comp: string
): { precio: number | null; nota: string | null } {
  switch (comp) {
    case 'individual': return { precio: tramo.ind, nota: null };
    case 'matrimonio': return { precio: tramo.mat ?? null, nota: tramo.mat ? null : 'Solo individual disponible en este tramo' };
    case 'ind+1':      return { precio: tramo.ind_h ?? null, nota: null };
    case 'ind+2':      return tramo.ind_h != null && tramo.h25 != null
                         ? { precio: tramo.ind_h + tramo.h25, nota: null }
                         : { precio: null, nota: 'Consultar composición' };
    case 'mat+1':      return { precio: tramo.mat_h ?? null, nota: null };
    case 'mat+2':      return tramo.mat_h != null && tramo.h25 != null
                         ? { precio: tramo.mat_h + tramo.h25, nota: null }
                         : { precio: null, nota: 'Consultar composición' };
    case 'mat+3':      return tramo.mat_h != null && tramo.h25 != null
                         ? { precio: tramo.mat_h + tramo.h25 * 2, nota: null }
                         : { precio: null, nota: 'Consultar composición' };
    default:           return { precio: null, nota: 'Composición no disponible' };
  }
}

const planes: Plan[] = [
  {
    id: 'abierto', nombre: 'Plan Abierto Integral', nivel: 4,
    descripcion: 'Con internación · Todas las clínicas en cartilla · Plan 4100/4101',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'cerrado', nombre: 'Plan Cerrado Del Buen Pastor', nivel: 3,
    descripcion: 'Con internación · Solo Clínica Del Buen Pastor · Plan 1100/1101',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'compl_abierto', nombre: 'Plan Compl. Sin Internación (Abierto)', nivel: 2,
    descripcion: 'Sin internación · Todas las clínicas · Plan S100/S101',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'compl_cerrado', nombre: 'Plan Compl. Sin Internación (Cerrado)', nivel: 1,
    descripcion: 'Sin internación · Solo Clínica Del Buen Pastor · Plan S2100/S2101',
    tarifas: { con_iva: null, sin_iva: null },
  },
];

export const bayresplan: Prepaga = {
  id: 'bayresplan',
  nombre: 'BAYRESPLAN',
  vigencia: 'Abril 2026',
  zona: 'AMBA (AMSM del Oeste)',
  color: '#1A6EB5',
  activa: true,
  planes,

  promociones: [
    {
      label: '35% Tarjeta bancaria',
      descripcion: 'Promoción obligatoria: 35% de descuento por 6 meses adhiriendo tarjeta bancaria Visa, Mastercard o Amex (NO financieras). Renovable si paga en tiempo y forma.',
      tipo: 'temporal',
      duracion_meses: 6,
    },
    {
      label: '25% Transferencia/MP',
      descripcion: 'Alternativa: 25% de descuento por transferencia, MercadoPago, Pago Fácil o RapiPago.',
      tipo: 'permanente',
    },
  ],

  getTramo(edad) {
    if (edad >= 18 && edad <= 29) return 'joven';
    if (edad >= 0  && edad <= 49) return '0-49';
    if (edad >= 50 && edad <= 59) return '50-59';
    return null;
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
    const tramo = this.getTramo(edad);
    if (!tramo) return null;

    const nota35 = 'Precio con 35% promo tarjeta bancaria. Sin tarjeta: precio es ~15% mayor.';

    let result: { precio: number | null; nota: string | null };

    if (plan.id === 'abierto') {
      if (tramo === 'joven') {
        result = calcComp(
          { ...JOVEN_ABIERTO_18_29, mat: 0, mat_h: 0, h25: 0, ind_h: 0 },
          compCanonica
        );
        if (compCanonica !== 'individual') result = { precio: null, nota: 'Plan Joven: solo Individual. Consultar otras composiciones.' };
      } else if (tramo === '0-49') {
        result = calcComp(ABIERTO_0_49 as any, compCanonica);
      } else {
        result = calcComp(ABIERTO_50_59 as any, compCanonica);
      }
    } else if (plan.id === 'cerrado') {
      if (tramo === 'joven') {
        if (compCanonica !== 'individual') return { precio: null, nota: 'Plan Joven Cerrado: solo Individual.' };
        result = { precio: JOVEN_CERRADO_18_29.ind, nota: null };
      } else if (tramo === '0-49') {
        result = calcComp(CERRADO_0_49 as any, compCanonica);
      } else {
        result = calcComp(CERRADO_50_59 as any, compCanonica);
      }
    } else if (plan.id === 'compl_abierto') {
      if (tramo === 'joven' || tramo === '0-49') {
        result = calcComp(COMPL_ABIERTO_0_49 as any, compCanonica);
      } else {
        result = calcComp(COMPL_ABIERTO_50_59 as any, compCanonica);
      }
    } else if (plan.id === 'compl_cerrado') {
      if (tramo === 'joven' || tramo === '0-49') {
        result = calcComp(COMPL_CERRADO_0_49 as any, compCanonica);
      } else {
        result = calcComp(COMPL_CERRADO_50_59 as any, compCanonica);
      }
    } else {
      return null;
    }

    return {
      precio: result.precio,
      nota: result.nota ?? nota35,
    };
  },
};
