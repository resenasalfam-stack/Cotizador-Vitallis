import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// CONTIGO SALUD — Abril 2026
// Pricing model: precio por cápita según edad del titular
// Bonificaciones:
//   - 15% débito automático de por vida (todos los planes)
//   - Acelerador 1 cápita: 10% adicional x 6 meses
//   - Acelerador 2+ cápitas: 20% x 6 meses + 10% x 6 meses
//   - 50% OFF menores hasta 18 años (Premium, Preferencial, Estandar)
//     → 1 menor por adulto afiliado (1 adulto=1 menor con 50%, 2 adultos=2 menores)
// COPAGO: VMD $12.500 / CM y CAF $10.500

// Precio por cápita por plan y tramo etario
const CAPITA: Record<string, Record<string, number>> = {
  premium:     { '18-29': 79450,  '30-49': 79450,  '50-69': 134227, '70+': 198107 },
  preferencial:{ '18-29': 59917,  '30-49': 59917,  '50-69': 99245,  '70+': 145975 },
  estandar:    { 'todos': 47904 },
  esencial:    { 'todos': 40539 },
  s710plus:    { 'todos': 42928 },
};

// Tramo etario para planes age-based
function getTramoContigo(edad: number): string {
  if (edad <= 29) return '18-29';
  if (edad <= 49) return '30-49';
  if (edad <= 69) return '50-69';
  return '70+';
}

function getPrecioCapita(planId: string, edad: number): number | null {
  const tabla = CAPITA[planId];
  if (!tabla) return null;
  if ('todos' in tabla) return tabla['todos'];
  const tramo = getTramoContigo(edad);
  return tabla[tramo] ?? null;
}

// Número de adultos y menores según composición
function parseComp(comp: string): { adultos: number; menores: number } {
  switch (comp) {
    case 'individual': return { adultos: 1, menores: 0 };
    case 'matrimonio': return { adultos: 2, menores: 0 };
    case 'ind+1':      return { adultos: 1, menores: 1 };
    case 'ind+2':      return { adultos: 1, menores: 2 };
    case 'mat+1':      return { adultos: 2, menores: 1 };
    case 'mat+2':      return { adultos: 2, menores: 2 };
    case 'mat+3':      return { adultos: 2, menores: 3 };
    default:           return { adultos: 1, menores: 0 };
  }
}

// Planes con 50% off para menores
const CON_PROMO_MENOR = new Set(['premium', 'preferencial', 'estandar']);

const planes: Plan[] = [
  {
    id: 'premium', nombre: 'Plan Premium', nivel: 5,
    descripcion: 'Cobertura completa · Todos los prestadores · Servicio a domicilio',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'preferencial', nombre: 'Plan Preferencial', nivel: 4,
    descripcion: 'Cobertura preferencial · Red ampliada de prestadores',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'estandar', nombre: 'Plan Estándar', nivel: 3,
    descripcion: 'Cobertura estándar · Precio fijo por cápita sin distinción etaria',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 'esencial', nombre: 'Plan Esencial+', nivel: 2,
    descripcion: 'Cobertura básica · Precio fijo por cápita',
    tarifas: { con_iva: null, sin_iva: null },
  },
  {
    id: 's710plus', nombre: 'Plan S710 Plus', nivel: 1,
    descripcion: 'Plan básico · Para zonas sin servicio a domicilio',
    tarifas: { con_iva: null, sin_iva: null },
  },
];

export const contigo: Prepaga = {
  id: 'contigo',
  nombre: 'CONTIGO SALUD',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#7C3AED',
  activa: true,
  planes,

  promociones: [
    {
      label: '15% débito automático',
      descripcion: '15% de descuento de por vida adhiriendo débito automático. Aplica a todos los planes.',
      tipo: 'permanente',
    },
    {
      label: '10% acelerador 1 cápita',
      descripcion: 'Acelerador 1 cápita: 10% adicional por 6 meses.',
      tipo: 'temporal',
      duracion_meses: 6,
    },
    {
      label: '20%+10% acelerador 2+ cápitas',
      descripcion: 'Acelerador 2+ cápitas: 20% por 6 meses, luego 10% por 6 meses más.',
      tipo: 'temporal',
      duracion_meses: 12,
    },
    {
      label: '50% menores hasta 18',
      descripcion: 'Promo Extra: 50% OFF para menores hasta 18 años. Un menor por adulto afiliado. Aplica en Premium, Preferencial y Estándar.',
      tipo: 'permanente',
      aplica_planes: ['premium', 'preferencial', 'estandar'],
    },
  ],

  getTramo(edad) {
    return getTramoContigo(edad);
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

  calcPrecio(plan, edad, compCanonica, _modalidad, grupo?: GrupoFamiliar): PrecioResult | null {
    const { adultos, menores } = parseComp(compCanonica);

    let precio = 0;

    // Titular
    const edadTitular = grupo?.titular ?? edad;
    const pTitular = getPrecioCapita(plan.id, edadTitular);
    if (pTitular == null) return null;
    precio += pTitular;

    // Cónyuge (si aplica)
    if (adultos >= 2) {
      const edadConj = grupo?.conyuge ?? edadTitular;
      const pConj = getPrecioCapita(plan.id, edadConj);
      if (pConj == null) return null;
      precio += pConj;
    }

    // Hijos / menores
    if (menores > 0) {
      let descuentosRestantes = CON_PROMO_MENOR.has(plan.id) ? adultos : 0;
      for (let i = 0; i < menores; i++) {
        const hijoEdad = grupo?.hijos[i];
        if (hijoEdad !== undefined && hijoEdad >= 18) {
          // Hijo adulto-joven → precio por su propio tramo, sin descuento de menor
          const pHijo = getPrecioCapita(plan.id, hijoEdad);
          if (pHijo == null) return null;
          precio += pHijo;
        } else {
          // Menor de 18 → usa tramo '18-29' como base
          const pMenor = getPrecioCapita(plan.id, 18);
          if (pMenor == null) return null;
          if (descuentosRestantes > 0) {
            precio += pMenor * 0.5;
            descuentosRestantes--;
          } else {
            precio += pMenor;
          }
        }
      }
    }

    const notaMenores = menores > adultos && CON_PROMO_MENOR.has(plan.id)
      ? ` · 50% off aplicado a ${adultos} menor(es), resto a precio completo.`
      : '';
    const nota = 'Precio por cápita según edad de cada integrante. Con débito automático: 15% adicional de por vida.' + notaMenores;

    return { precio: Math.round(precio), nota };
  },
};
