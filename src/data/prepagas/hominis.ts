import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// HOMINIS — AMBA — JULIO 2026 (PDFs oficiales del Drive: AQUA MAS y VITA MAS)
// con_iva = particular · sin_iva = con aportes (dependencia / monotributo)
// Bandas: juvenil (18-25 sin hijos) · hasta39 · hasta49 · hasta64 · 65mas

type HomTabla = Record<string, Record<string, number | null>>;
const TARIFAS: Record<string, { con_iva: HomTabla; sin_iva: HomTabla }> = {"AQUA MAS":{"con_iva":{"individual":{"juvenil":85794,"hasta39":107200,"hasta49":139209,"hasta64":188033,"65mas":272603},"individual+1":{"juvenil":null,"hasta39":160590,"hasta49":192599,"hasta64":241422,"65mas":325993},"individual+2":{"juvenil":null,"hasta39":209903,"hasta49":241912,"hasta64":290735,"65mas":375306},"individual+3":{"juvenil":null,"hasta39":254912,"hasta49":286921,"hasta64":335744,"65mas":420315},"individual+4":{"juvenil":null,"hasta39":296266,"hasta49":328276,"hasta64":377099,"65mas":461670},"individual+5":{"juvenil":null,"hasta39":334071,"hasta49":366080,"hasta64":414903,"65mas":499474},"matrimonio":{"juvenil":162775,"hasta39":203532,"hasta49":264566,"hasta64":357124,"65mas":517811},"matrimonio+1":{"juvenil":null,"hasta39":256922,"hasta49":317956,"hasta64":410514,"65mas":571201},"matrimonio+2":{"juvenil":null,"hasta39":306234,"hasta49":367269,"hasta64":459827,"65mas":620514},"matrimonio+3":{"juvenil":null,"hasta39":351243,"hasta49":412278,"hasta64":504836,"65mas":665523},"matrimonio+4":{"juvenil":null,"hasta39":392598,"hasta49":453633,"hasta64":546191,"65mas":706877},"matrimonio+5":{"juvenil":null,"hasta39":430402,"hasta49":491437,"hasta64":583995,"65mas":744682}},"sin_iva":{"individual":{"juvenil":77642,"hasta39":97013,"hasta49":125981,"hasta64":170165,"65mas":246700},"individual+1":{"juvenil":null,"hasta39":145330,"hasta49":174298,"hasta64":218482,"65mas":295016},"individual+2":{"juvenil":null,"hasta39":189957,"hasta49":218925,"hasta64":263109,"65mas":339643},"individual+3":{"juvenil":null,"hasta39":230689,"hasta49":259657,"hasta64":303841,"65mas":380376},"individual+4":{"juvenil":null,"hasta39":268114,"hasta49":297082,"hasta64":341266,"65mas":417801},"individual+5":{"juvenil":null,"hasta39":302326,"hasta49":331294,"hasta64":375478,"65mas":452012},"matrimonio":{"juvenil":147308,"hasta39":184191,"hasta49":239426,"hasta64":323189,"65mas":468607},"matrimonio+1":{"juvenil":null,"hasta39":232508,"hasta49":287743,"hasta64":371506,"65mas":516924},"matrimonio+2":{"juvenil":null,"hasta39":277135,"hasta49":332370,"hasta64":416133,"65mas":561551},"matrimonio+3":{"juvenil":null,"hasta39":317867,"hasta49":373102,"hasta64":456865,"65mas":602283},"matrimonio+4":{"juvenil":null,"hasta39":355292,"hasta49":410527,"hasta64":494290,"65mas":639708},"matrimonio+5":{"juvenil":null,"hasta39":389504,"hasta49":444739,"hasta64":528502,"65mas":673920}}},"VITA MAS":{"con_iva":{"individual":{"juvenil":109993,"hasta39":137436,"hasta49":178473,"hasta64":241068,"65mas":349491},"individual+1":{"juvenil":null,"hasta39":205884,"hasta49":246922,"hasta64":309516,"65mas":417940},"individual+2":{"juvenil":null,"hasta39":269106,"hasta49":310144,"hasta64":372738,"65mas":481161},"individual+3":{"juvenil":null,"hasta39":326810,"hasta49":367848,"hasta64":430442,"65mas":538865},"individual+4":{"juvenil":null,"hasta39":379829,"hasta49":420866,"hasta64":483460,"65mas":591884},"individual+5":{"juvenil":null,"hasta39":428296,"hasta49":469333,"hasta64":531927,"65mas":640351},"matrimonio":{"juvenil":208686,"hasta39":260938,"hasta49":339188,"hasta64":457852,"65mas":663860},"matrimonio+1":{"juvenil":null,"hasta39":329386,"hasta49":407636,"hasta64":526300,"65mas":732309},"matrimonio+2":{"juvenil":null,"hasta39":392608,"hasta49":470858,"hasta64":589522,"65mas":795530},"matrimonio+3":{"juvenil":null,"hasta39":450312,"hasta49":528562,"hasta64":647226,"65mas":853234},"matrimonio+4":{"juvenil":null,"hasta39":503331,"hasta49":581580,"hasta64":700245,"65mas":906253},"matrimonio+5":{"juvenil":null,"hasta39":551798,"hasta49":630047,"hasta64":748712,"65mas":954720}},"sin_iva":{"individual":{"juvenil":99541,"hasta39":124376,"hasta49":161514,"hasta64":218161,"65mas":316282},"individual+1":{"juvenil":null,"hasta39":186321,"hasta49":223459,"hasta64":280105,"65mas":378226},"individual+2":{"juvenil":null,"hasta39":243535,"hasta49":280673,"hasta64":337319,"65mas":435440},"individual+3":{"juvenil":null,"hasta39":295756,"hasta49":332894,"hasta64":389540,"65mas":487661},"individual+4":{"juvenil":null,"hasta39":343736,"hasta49":380874,"hasta64":437521,"65mas":535642},"individual+5":{"juvenil":null,"hasta39":387598,"hasta49":424736,"hasta64":481382,"65mas":579503},"matrimonio":{"juvenil":188856,"hasta39":236143,"hasta49":306957,"hasta64":414345,"65mas":600778},"matrimonio+1":{"juvenil":null,"hasta39":298087,"hasta49":368901,"hasta64":476290,"65mas":662723},"matrimonio+2":{"juvenil":null,"hasta39":355301,"hasta49":426116,"hasta64":533504,"65mas":719937},"matrimonio+3":{"juvenil":null,"hasta39":407522,"hasta49":478336,"hasta64":585725,"65mas":772158},"matrimonio+4":{"juvenil":null,"hasta39":455503,"hasta49":526317,"hasta64":633705,"65mas":820138},"matrimonio+5":{"juvenil":null,"hasta39":499365,"hasta49":570179,"hasta64":677567,"65mas":864000}}}};

function band(edad: number, nHijos: number): string {
  if (edad <= 25 && nHijos === 0) return 'juvenil';
  if (edad <= 39) return 'hasta39';
  if (edad <= 49) return 'hasta49';
  if (edad <= 64) return 'hasta64';
  return '65mas';
}

const planes: Plan[] = [
  { id: 'AQUA MAS', nombre: 'Plan Aqua Mas', nivel: 2, descripcion: 'Cobertura integral Hominis', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'VITA MAS', nombre: 'Plan Vita Mas', nivel: 3, descripcion: 'Cobertura superior Hominis', tarifas: { con_iva: null, sin_iva: null } },
];

export const hominis: Prepaga = {
  id: 'hominis',
  nombre: 'HOMINIS',
  vigencia: 'Julio 2026',
  zona: 'AMBA',
  color: '#7B3FA0',
  activa: true,
  planes,

  getTramo(edad) { return band(edad, 0); },

  mapComp: {
    individual: 'individual', matrimonio: 'matrimonio',
    'ind+1': 'individual+1', 'ind+2': 'individual+2',
    'mat+1': 'matrimonio+1', 'mat+2': 'matrimonio+2', 'mat+3': 'matrimonio+3',
  },

  calcPrecio(plan, edad, compCanonica, modalidad, grupo?: GrupoFamiliar): PrecioResult | null {
    const edadTit = grupo?.titular ?? edad;
    if (edadTit < 18) return { precio: null, nota: 'Edad mínima 18 años' };
    const compKey = this.mapComp[compCanonica];
    if (!compKey) return null;
    const nHijos = compCanonica.endsWith('+1') ? 1 : compCanonica.endsWith('+2') ? 2 : compCanonica.endsWith('+3') ? 3 : 0;
    const t = TARIFAS[plan.id][modalidad === 'particular' ? 'con_iva' : 'sin_iva'];
    let b = band(edadTit, nHijos);
    let precio = t?.[compKey]?.[b] ?? null;
    if (precio == null && b === 'juvenil') { b = 'hasta39'; precio = t?.[compKey]?.[b] ?? null; }
    if (precio == null) return { precio: null, nota: 'No disponible — consultar' };
    return { precio, nota: modalidad === 'particular' ? 'IVA incluido' : 'Sin IVA (con aportes)' };
  },
};
