import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// OMINT — AMBA — ABRIL 2026 (xlsx oficial del Drive; SOLO DESREGULADOS con aportes)
// Precio por adulto (titular / cónyuge) por banda [0-35, 36-54, 55-59, 60+]; hijos: banda 0-35.

type OmintTabla = Record<string, Record<string, number | null>>;
const LISTA: OmintTabla = {"1500_21":{"0-35":139317,"36-54":158807,"55-59":278757,"60+":417959},"1500_22":{"0-35":152888,"36-54":197159,"55-59":362159,"60+":458667},"2500_24":{"0-35":223155,"36-54":263572,"55-59":446520,"60+":669464},"4021_22":{"0-35":238636,"36-54":280164,"55-59":483133,"60+":715911},"4500_23":{"0-35":251089,"36-54":294786,"55-59":508345,"60+":753267},"4500_24":{"0-35":268310,"36-54":321980,"55-59":545698,"60+":804929},"6500_21":{"0-35":312095,"36-54":365531,"55-59":612521,"60+":936286},"6500_22":{"0-35":349308,"36-54":444036,"55-59":659411,"60+":1047927},"8500_21":{"0-35":499873,"36-54":658019,"55-59":916910,"60+":1499613},"8500_22":{"0-35":568721,"36-54":760558,"55-59":1029481,"60+":1706163},"1500_20":{"0-35":123007,"36-54":168901,"55-59":303957,"60+":369016},"2500_20":{"0-35":147511,"36-54":186450,"55-59":348295,"60+":442540},"4021_20":{"0-35":159353,"36-54":194759,"55-59":378436,"60+":478056},"4500_20":{"0-35":186454,"36-54":226987,"55-59":437265,"60+":559361},"6500_20":{"0-35":201540,"36-54":244603,"55-59":467992,"60+":604623},"Midoc_10":{"0-35":186901,"36-54":250218,"55-59":388436,"60+":560706},"COMUNIDAD_SC":{"0-35":189681,"36-54":224037,"55-59":379543,"60+":569043},"COMUNIDAD_CC":{"0-35":125387,"36-54":158483,"55-59":296052,"60+":376160},"Omint Vos":{"0-35":127767,"36-54":159710,"55-59":479130,"60+":null}};

function band(edad: number): string {
  if (edad <= 35) return '0-35';
  if (edad <= 54) return '36-54';
  if (edad <= 59) return '55-59';
  return '60+';
}

const planes: Plan[] = [
  { id: '1500_21', nombre: 'Plan 1500_21', nivel: 1, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '1500_22', nombre: 'Plan 1500_22', nivel: 1, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '2500_24', nombre: 'Plan 2500_24', nivel: 2, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '4021_22', nombre: 'Plan 4021_22', nivel: 3, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '4500_23', nombre: 'Plan 4500_23', nivel: 3, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '4500_24', nombre: 'Plan 4500_24', nivel: 3, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '6500_21', nombre: 'Plan 6500_21', nivel: 4, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '6500_22', nombre: 'Plan 6500_22', nivel: 4, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '8500_21', nombre: 'Plan 8500_21', nivel: 5, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '8500_22', nombre: 'Plan 8500_22', nivel: 5, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '1500_20', nombre: 'Plan 1500_20', nivel: 1, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '2500_20', nombre: 'Plan 2500_20', nivel: 2, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '4021_20', nombre: 'Plan 4021_20', nivel: 3, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '4500_20', nombre: 'Plan 4500_20', nivel: 3, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: '6500_20', nombre: 'Plan 6500_20', nivel: 4, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'Midoc_10', nombre: 'Plan Midoc_10', nivel: 1, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'COMUNIDAD_SC', nombre: 'Plan COMUNIDAD_SC', nivel: 1, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'COMUNIDAD_CC', nombre: 'Plan COMUNIDAD_CC', nivel: 1, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'Omint Vos', nombre: 'Plan Omint Vos', nivel: 1, descripcion: 'Desregulados · por cápita', tarifas: { con_iva: null, sin_iva: null } },
];

export const omint: Prepaga = {
  id: 'omint',
  nombre: 'OMINT',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#1B3765',
  activa: true,
  planes,

  getTramo(edad) { return band(edad); },

  mapComp: {
    individual: 'individual', matrimonio: 'matrimonio',
    'ind+1': 'ind+1', 'ind+2': 'ind+2',
    'mat+1': 'mat+1', 'mat+2': 'mat+2', 'mat+3': 'mat+3',
  },

  calcPrecio(plan, edad, compCanonica, modalidad, grupo?: GrupoFamiliar): PrecioResult | null {
    if (modalidad === 'particular') return { precio: null, nota: 'Omint solo cotiza desregulados (con aportes de obra social)' };
    const bands = LISTA[plan.id];
    if (!bands) return null;
    const edadTit = grupo?.titular ?? edad;
    let precio = bands[band(edadTit)];
    if (precio == null) return null;
    if (compCanonica.startsWith('mat')) {
      const pc = bands[band(grupo?.conyuge ?? edadTit)];
      if (pc == null) return null;
      precio += pc;
    }
    const nHijos = compCanonica.endsWith('+1') ? 1 : compCanonica.endsWith('+2') ? 2 : compCanonica.endsWith('+3') ? 3 : 0;
    const ph = bands['0-35'];
    if (nHijos > 0) {
      if (ph == null) return null;
      precio += ph * nHijos;
    }
    return { precio: Math.round(precio), nota: 'Desregulados · precio por cápita · No incluye ap. voluntarios' };
  },
};
