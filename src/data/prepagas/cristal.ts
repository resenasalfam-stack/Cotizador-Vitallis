import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// CRISTAL SALUD — AMBA — OCTUBRE 2025 (última lista disponible en Drive; verificar vigencia)
// Precio por persona: titular y cónyuge por banda etaria + H1/H2/H3 por hijo (1º, 2º, 3º en adelante).

type CristalTabla = Record<string, Record<string, number>>;
const CON_IVA: CristalTabla = {"0-17":{"ESMERALDA":96047,"ZAFIRO":70623,"CUARZO":60736,"500 PRIVADO":47317},"18-25":{"ESMERALDA":103248,"ZAFIRO":75917,"CUARZO":65289,"500 PRIVADO":50865},"26-35":{"ESMERALDA":153448,"ZAFIRO":112830,"CUARZO":97033,"500 PRIVADO":75596},"36-45":{"ESMERALDA":191810,"ZAFIRO":141037,"CUARZO":121292,"500 PRIVADO":94495},"46-55":{"ESMERALDA":244301,"ZAFIRO":179633,"CUARZO":154484,"500 PRIVADO":120354},"56-60":{"ESMERALDA":271445,"ZAFIRO":199592,"CUARZO":171311,"500 PRIVADO":133727},"61-65":{"ESMERALDA":352879,"ZAFIRO":259470,"CUARZO":223144,"500 PRIVADO":173845},"66-70":{"ESMERALDA":458743,"ZAFIRO":337311,"CUARZO":290087,"500 PRIVADO":225998},"71-75":{"ESMERALDA":504617,"ZAFIRO":371042,"CUARZO":319096,"500 PRIVADO":248598},"76-80":{"ESMERALDA":570272,"ZAFIRO":419318,"CUARZO":360613,"500 PRIVADO":280943},"81-85":{"ESMERALDA":1082297,"ZAFIRO":795807,"CUARZO":684394,"500 PRIVADO":533191},"86-99":{"ESMERALDA":1515216,"ZAFIRO":1114130,"CUARZO":958152,"500 PRIVADO":746467},"H1":{"ESMERALDA":81511,"ZAFIRO":59935,"CUARZO":51544,"500 PRIVADO":40156},"H2":{"ESMERALDA":61586,"ZAFIRO":45397,"CUARZO":38944,"500 PRIVADO":30340},"H3":{"ESMERALDA":52505,"ZAFIRO":38607,"CUARZO":33202,"500 PRIVADO":25866}};
const SIN_IVA: CristalTabla = {"0-17":{"ESMERALDA":86921,"ZAFIRO":63912,"CUARZO":54964,"500 PRIVADO":42821},"18-25":{"ESMERALDA":93437,"ZAFIRO":68703,"CUARZO":59085,"500 PRIVADO":46031},"26-35":{"ESMERALDA":138867,"ZAFIRO":102108,"CUARZO":87813,"500 PRIVADO":68412},"36-45":{"ESMERALDA":173584,"ZAFIRO":127635,"CUARZO":109766,"500 PRIVADO":85516},"46-55":{"ESMERALDA":221087,"ZAFIRO":162564,"CUARZO":139805,"500 PRIVADO":108918},"56-60":{"ESMERALDA":245652,"ZAFIRO":180626,"CUARZO":155033,"500 PRIVADO":121020},"61-65":{"ESMERALDA":319347,"ZAFIRO":234814,"CUARZO":201940,"500 PRIVADO":157326},"66-70":{"ESMERALDA":415152,"ZAFIRO":305259,"CUARZO":262522,"500 PRIVADO":204523},"71-75":{"ESMERALDA":456667,"ZAFIRO":335784,"CUARZO":288775,"500 PRIVADO":224976},"76-80":{"ESMERALDA":516083,"ZAFIRO":379473,"CUARZO":326347,"500 PRIVADO":254247},"81-85":{"ESMERALDA":979455,"ZAFIRO":720187,"CUARZO":619361,"500 PRIVADO":482525},"86-99":{"ESMERALDA":1371237,"ZAFIRO":1008262,"CUARZO":867106,"500 PRIVADO":675536},"H1":{"ESMERALDA":73766,"ZAFIRO":54240,"CUARZO":46646,"500 PRIVADO":36341},"H2":{"ESMERALDA":55734,"ZAFIRO":41083,"CUARZO":35244,"500 PRIVADO":27457},"H3":{"ESMERALDA":47516,"ZAFIRO":34938,"CUARZO":30047,"500 PRIVADO":23409}};

const BANDAS: [number, number][] = [[0, 17], [18, 25], [26, 35], [36, 45], [46, 55], [56, 60], [61, 65], [66, 70], [71, 75], [76, 80], [81, 85], [86, 99]];
function band(edad: number): string | null {
  const b = BANDAS.find(([a, z]) => edad >= a && edad <= z);
  return b ? `${b[0]}-${b[1]}` : null;
}

const planes: Plan[] = [
  { id: '500 PRIVADO', nombre: 'Plan 500 Privado', nivel: 1, descripcion: 'Cobertura base Cristal', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'CUARZO', nombre: 'Plan Cuarzo', nivel: 2, descripcion: 'Cobertura media', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'ZAFIRO', nombre: 'Plan Zafiro', nivel: 3, descripcion: 'Cobertura amplia', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'ESMERALDA', nombre: 'Plan Esmeralda', nivel: 4, descripcion: 'Plan superior Cristal', tarifas: { con_iva: null, sin_iva: null } },
];

export const cristal: Prepaga = {
  id: 'cristal',
  nombre: 'CRISTAL SALUD',
  vigencia: 'Octubre 2025',
  zona: 'AMBA',
  color: '#00A4A6',
  activa: true,
  planes,

  getTramo(edad) { return band(edad); },

  mapComp: {
    individual: 'individual', matrimonio: 'matrimonio',
    'ind+1': 'ind+1', 'ind+2': 'ind+2',
    'mat+1': 'mat+1', 'mat+2': 'mat+2', 'mat+3': 'mat+3',
  },

  calcPrecio(plan, edad, compCanonica, modalidad, grupo?: GrupoFamiliar): PrecioResult | null {
    const tabla = modalidad === 'particular' ? CON_IVA : SIN_IVA;
    const bt = band(grupo?.titular ?? edad);
    if (!bt) return { precio: null, nota: 'Edad fuera de rango' };
    let precio = tabla[bt]?.[plan.id];
    if (precio == null) return null;

    if (compCanonica.startsWith('mat')) {
      const bc = band(grupo?.conyuge ?? (grupo?.titular ?? edad));
      const pc = bc ? tabla[bc]?.[plan.id] : null;
      if (pc == null) return { precio: null, nota: 'Edad cónyuge fuera de rango' };
      precio += pc;
    }
    const nHijos = compCanonica.endsWith('+1') ? 1 : compCanonica.endsWith('+2') ? 2 : compCanonica.endsWith('+3') ? 3 : 0;
    if (nHijos >= 1) precio += tabla['H1']?.[plan.id] ?? 0;
    if (nHijos >= 2) precio += tabla['H2']?.[plan.id] ?? 0;
    if (nHijos >= 3) precio += tabla['H3']?.[plan.id] ?? 0;

    return { precio: Math.round(precio), nota: modalidad === 'particular' ? 'IVA incluido · Lista Oct-25' : 'Sin IVA · Lista Oct-25' };
  },
};
