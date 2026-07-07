import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// SWISS MEDICAL — Directos AMBA — JULIO 2026 (listas oficiales del Drive)
// Promos Monotributo/Particular: <26 años 50%, 26-64 años 25% — por 1 año
// Promos Recibo/Dependencia:     <26 años 50%, 26-64 años 15% — por 1 año
// IMPORTANTE: Para monotributo, los aportes OS NO se descuentan del precio (Swiss no los acepta)
// NOTA: aporte real dependencia = salario × 7% (fórmula: aporte/3×7)

// Monotributo / Particular (con IVA) — Julio 2026
const LISTA: Record<string, Record<string, number>> = {
  'S1': { 'hasta35': 189674, '36-40': 227609, '41-45': 238989, '46-50': 262905, '51-55': 341743, '56-60': 444291, '61+': 559539 },
  'SMG02': { 'hasta35': 266258, '36-40': 319509, '41-45': 335485, '46-50': 369057, '51-55': 479727, '56-60': 623680, '61+': 785461 },
  'S2': { 'hasta35': 238124, '36-40': 285740, '41-45': 300009, '46-50': 330038, '51-55': 429046, '56-60': 557751, '61+': 702465 },
  'Sport-S': { 'hasta35': 295273, '36-40': 354318, '41-45': 372010, '46-50': 409247, '51-55': 532017, '56-60': 691611, '61+': 871057 },
  'SMG20': { 'hasta35': 332301, '36-40': 398750, '41-45': 418662, '46-50': 460568, '51-55': 598733, '56-60': 778341, '61+': 980289 },
  'SMG30': { 'hasta35': 381733, '36-40': 458079, '41-45': 481001, '46-50': 529101, '51-55': 687814, '56-60': 894163, '61+': 1126112 },
  'Sport': { 'hasta35': 388793, '36-40': 466538, '41-45': 489834, '46-50': 538865, '51-55': 700518, '56-60': 910660, '61+': 1146939 },
  'SMG40': { 'hasta35': 398982, '36-40': 478801, '41-45': 502706, '46-50': 553006, '51-55': 718896, '56-60': 934565, '61+': 1176996 },
  'Sport+': { 'hasta35': 454839, '36-40': 545833, '41-45': 573086, '46-50': 630427, '51-55': 819542, '56-60': 1065405, '61+': 1341775 },
  'SMG50': { 'hasta35': 498539, '36-40': 598212, '41-45': 628137, '46-50': 690939, '51-55': 898215, '56-60': 1167714, '61+': 1470690 },
  'SMG60': { 'hasta35': 701995, '36-40': 842417, '41-45': 884555, '46-50': 972999, '51-55': 1264899, '56-60': 1644374, '61+': 2070884 },
  'SMG70': { 'hasta35': 854283, '36-40': 1025151, '41-45': 1076434, '46-50': 1184037, '51-55': 1539260, '56-60': 2001044, '61+': 2520134 },
};

// Recibo / Dependencia — Derivación Directa AMBA — Julio 2026
const LISTA_RECIBO: Record<string, Record<string, number>> = {
  'S1': { 'hasta35': 150726, '36-40': 180872, '41-45': 189908, '46-50': 208902, '51-55': 271577, '56-60': 353053, '61+': 444643 },
  'SMG02': { 'hasta35': 211584, '36-40': 253901, '41-45': 266585, '46-50': 293249, '51-55': 381230, '56-60': 495604, '61+': 624174 },
  'S2': { 'hasta35': 186275, '36-40': 223522, '41-45': 234700, '46-50': 258178, '51-55': 335651, '56-60': 436330, '61+': 549511 },
  'Sport-S': { 'hasta35': 230981, '36-40': 277168, '41-45': 291028, '46-50': 320141, '51-55': 416207, '56-60': 541050, '61+': 681394 },
  'SMG20': { 'hasta35': 259946, '36-40': 311925, '41-45': 327524, '46-50': 360287, '51-55': 468400, '56-60': 608899, '61+': 766842 },
  'SMG30': { 'hasta35': 286395, '36-40': 343663, '41-45': 360827, '46-50': 396937, '51-55': 516007, '56-60': 670809, '61+': 844864 },
  'Sport': { 'hasta35': 304137, '36-40': 364952, '41-45': 383203, '46-50': 421536, '51-55': 548028, '56-60': 712411, '61+': 897205 },
  'SMG40': { 'hasta35': 340316, '36-40': 408379, '41-45': 428782, '46-50': 471693, '51-55': 613163, '56-60': 797112, '61+': 1003933 },
  'Sport+': { 'hasta35': 387960, '36-40': 465553, '41-45': 488812, '46-50': 537730, '51-55': 699006, '56-60': 908707, '61+': 1144483 },
  'SMG50': { 'hasta35': 405033, '36-40': 486050, '41-45': 510339, '46-50': 561400, '51-55': 729804, '56-60': 948729, '61+': 1194847 },
  'SMG60': { 'hasta35': 606092, '36-40': 727321, '41-45': 763701, '46-50': 840076, '51-55': 1092088, '56-60': 1419720, '61+': 1787971 },
  'SMG70': { 'hasta35': 743136, '36-40': 891785, '41-45': 936369, '46-50': 1029962, '51-55': 1338973, '56-60': 1740659, '61+': 2192251 },
};

// Hijos — Monotributo/Particular
const HIJOS: Record<string, { primer: number; adicional: number }> = {
  'S1': { primer: 135205, adicional: 98053 },
  'SMG02': { primer: 189796, adicional: 137644 },
  'S2': { primer: 201291, adicional: 144467 },
  'Sport-S': { primer: 249601, adicional: 179139 },
  'SMG20': { primer: 280902, adicional: 201604 },
  'SMG30': { primer: 326803, adicional: 234307 },
  'Sport': { primer: 328656, adicional: 235876 },
  'SMG40': { primer: 341505, adicional: 244610 },
  'Sport+': { primer: 389315, adicional: 278855 },
  'SMG50': { primer: 370851, adicional: 265158 },
  'SMG60': { primer: 400255, adicional: 285706 },
  'SMG70': { primer: 429601, adicional: 306254 },
};

// Hijos — Recibo/Dependencia
const HIJOS_RECIBO: Record<string, { primer: number; adicional: number }> = {
  'S1': { primer: 111545, adicional: 81592 },
  'SMG02': { primer: 156583, adicional: 114536 },
  'S2': { primer: 148448, adicional: 107216 },
  'Sport-S': { primer: 184075, adicional: 132948 },
  'SMG20': { primer: 207158, adicional: 149620 },
  'SMG30': { primer: 240839, adicional: 156367 },
  'Sport': { primer: 242375, adicional: 175056 },
  'SMG40': { primer: 251472, adicional: 163060 },
  'Sport+': { primer: 286678, adicional: 185889 },
  'SMG50': { primer: 272739, adicional: 176500 },
  'SMG60': { primer: 294059, adicional: 189886 },
  'SMG70': { primer: 315379, adicional: 203326 },
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
    id: 'S1', nombre: 'Plan S1', nivel: 1,
    descripcion: 'Internación básica · Solo AMBA',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'SMG02', nombre: 'Plan SMG02', nivel: 1,
    descripcion: 'Cartilla básica · Solo AMBA',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'S2', nombre: 'Plan S2', nivel: 2,
    descripcion: 'Internación ampliada · Con copagos',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'Sport-S', nombre: 'Plan Sport-S', nivel: 2,
    descripcion: 'Línea Sport · Internación',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'SMG20', nombre: 'Plan SMG20', nivel: 2,
    descripcion: 'Sin copagos · Red SMG',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'SMG30', nombre: 'Plan SMG30', nivel: 3,
    descripcion: 'Sin copagos · Red SMG ampliada',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'Sport', nombre: 'Plan Sport', nivel: 3,
    descripcion: 'Línea Sport · Cartilla',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'SMG40', nombre: 'Plan SMG40', nivel: 3,
    descripcion: 'Red SMG ampliada · Reintegros',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'Sport+', nombre: 'Plan Sport+', nivel: 4,
    descripcion: 'Línea Sport · Ampliado',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'SMG50', nombre: 'Plan SMG50', nivel: 4,
    descripcion: 'Sin copagos + Cirugía Estética',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'SMG60', nombre: 'Plan SMG60', nivel: 4,
    descripcion: 'Premium · Reintegros altos',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'SMG70', nombre: 'Plan SMG70', nivel: 5,
    descripcion: 'Plan top · Máxima cobertura',
    tarifas: { con_iva: null, sin_iva: null },
  },
];

export const swissMedical: Prepaga = {
  id: 'swiss_medical',
  nombre: 'SWISS MEDICAL',
  vigencia: 'Julio 2026',
  zona: 'AMBA',
  color: '#C8102E',
  activa: true,
  planes,
  dep_aporte_pct: 0.07, // aporte real dependencia = salario × 7%

  promociones: [
    {
      label: '50% menores de 26 años (1 año)',
      descripcion: '50% de descuento durante 1 año para afiliados menores de 26 años.',
      tipo: 'temporal',
      duracion_meses: 12,
    },
    {
      label: '25% mono/part · 15% recibo (1 año)',
      descripcion: 'Monotributo/Particular: 25% off por 1 año (26-64 años). Recibo/Dependencia: 15% off por 1 año (26-64 años).',
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

  calcPrecio(plan, edad, compCanonica, modalidad, grupo?: GrupoFamiliar): PrecioResult | null {
    const k = plan.id;
    const esRecibo = modalidad === 'dependencia';
    const esMono   = modalidad === 'monotributo';

    const tabla = esRecibo ? LISTA_RECIBO : LISTA;
    const hijosT = esRecibo ? HIJOS_RECIBO : HIJOS;
    const hijos  = hijosT[k];
    if (!hijos) return null;

    const descPct = esRecibo ? 15 : 25; // % promo 26-64 años

    function promoLabel(e: number): string {
      if (e < 26)  return `${e}a: 50% desc. 1er año`;
      if (e <= 64) return `${e}a: ${descPct}% desc. 1er año`;
      return '';
    }

    const edadTit = grupo?.titular ?? edad;
    const tramoTit = this.getTramo(edadTit);
    if (!tramoTit) return null;
    const precioTit = tabla[k]?.[tramoTit];
    if (precioTit == null || precioTit === 0) return null;

    let precioConyuge = precioTit;
    if (grupo?.conyuge) {
      const tramoConj = this.getTramo(grupo.conyuge);
      if (!tramoConj) return null;
      precioConyuge = tabla[k]?.[tramoConj] ?? precioTit;
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

    const promos: string[] = [];
    const notaTit = promoLabel(edadTit);
    if (notaTit) promos.push(`Titular: ${notaTit}`);
    if (grupo?.conyuge) {
      const n = promoLabel(grupo.conyuge);
      if (n) promos.push(`Cónyuge: ${n}`);
    }
    if (grupo?.hijos.length) {
      grupo.hijos.forEach((he, i) => {
        const n = promoLabel(he);
        if (n) promos.push(`Hijo ${i + 1}: ${n}`);
      });
    }
    if (!promos.length) {
      promos.push(promoLabel(edadTit) || 'Sin promo etaria (65+). Consultar descuentos.');
    }

    const notaMono = esMono ? 'Swiss no descuenta aportes OS de monotributo. ' : '';
    return {
      precio: Math.round(precio),
      nota: notaMono + promos.join(' · '),
      ignoraAporte: esMono,
    };
  },
};
