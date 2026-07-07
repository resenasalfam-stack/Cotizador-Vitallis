import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// DOCTORED — AMBA — JULIO 2026 (xlsx oficial del Drive LISTA DE PRECIO/JULIO2026)
// FULL = tarifa de lista · BONI = tarifa bonificada (promocional, consultar condiciones de permanencia)
// Bandas por plan (500 Plus llega a 46-55; el resto a 56-60). 'adicional_extra' = 3er hijo en adelante.

type DocPlan = { bands: string[]; tarifas: Record<string, (number | null)[]> };
const FULL: Record<string, DocPlan> = {"500 Plus":{"bands":["18-25","26-35","36-45","46-55","PLAN:","500 Plus","18-25","26-35","36-45","46-55"],"tarifas":{"individual":[93464,130850,155773,200280,null,null,null,null,null,null],"individual+1":[186928,224314,233660,267040,null,null,null,null,null,null],"individual+2":[252353,289738,288181,313772,null,null,null,null,null,null],"matrimonio":[186928,261699,288181,360504,null,null,null,null,null,null],"matrimonio+1":[280392,355163,366067,427264,null,null,null,null,null,null],"matrimonio+2":[345817,420588,420588,473996,null,null,null,null,null,null],"adicional_extra":[65425,65425,54521,46732,null,null,null,null,null,null],"adherente":[93464,130850,155773,200280,null,null,null,null,null,null]}},"1000":{"bands":["18-25","26-35","36-45","46-55","56-60","PLAN:","1000.0","18-25","26-35","36-45","46-55","56-60"],"tarifas":{"individual":[125105,175148,208509,268083,291913,null,null,null,null,null,113218,158505],"individual+1":[250211,300253,312764,357444,361416,null,null,null,null,null,226435,271722],"individual+2":[337785,387827,385742,419997,410068,null,null,null,null,null,305688,350975],"matrimonio":[250211,350295,385742,482550,554634,null,null,null,null,null,226435,317009],"matrimonio+1":[375316,475401,489996,571911,624137,null,null,null,null,null,339653,430227],"matrimonio+2":[462890,562975,562975,634463,672789,null,null,null,null,null,418905,509479],"adicional_extra":[87574,87574,72978,62553,48652,null,null,null,null,null,79252,79252],"adherente":[125105,175148,208509,268083,291913,null,null,null,null,null,113218,158505]}},"2000":{"bands":["18-25","26-35","36-45","46-55","56-60","PLAN:","2000.0","18-25","26-35","36-45","46-55","56-60"],"tarifas":{"individual":[169403,237165,282339,363007,395275,null,null,null,null,null,153306,214629],"individual+1":[338807,406568,423509,484010,489388,null,null,null,null,null,306613,367935],"individual+2":[457389,525151,522327,568712,555267,null,null,null,null,null,413927,475250],"matrimonio":[338807,474330,522327,653413,751022,null,null,null,null,null,306613,429258],"matrimonio+1":[508210,643733,663497,774416,845135,null,null,null,null,null,459919,582564],"matrimonio+2":[626793,762316,762316,859118,911014,null,null,null,null,null,567233,689878],"adicional_extra":[118582,118582,98819,84702,65879,null,null,null,null,null,107314,107314],"adherente":[169403,237165,282339,363007,395275,null,null,null,null,null,153306,214629]}},"3000":{"bands":["18-25","26-35","36-45","46-55","56-60","PLAN:","3000.0","18-25","26-35","36-45","46-55","56-60"],"tarifas":{"individual":[221977,310768,369962,475665,517946,null,null,null,null,null,200884,281238],"individual+1":[443954,532745,554942,634220,641267,null,null,null,null,null,401768,482122],"individual+2":[599338,688129,684429,745208,727591,null,null,null,null,null,542387,622741],"matrimonio":[443954,621535,684429,856197,984098,null,null,null,null,null,401768,562476],"matrimonio+1":[665931,843512,869410,1014752,1107418,null,null,null,null,null,602652,763360],"matrimonio+2":[821315,998896,998896,1125740,1193743,null,null,null,null,null,743271,903979],"adicional_extra":[155384,155384,129487,110988,86324,null,null,null,null,null,140619,140619],"adherente":[221977,310768,369962,475665,517946,null,null,null,null,null,200884,281238]}}};
const BONI: Record<string, DocPlan> = {"500 Plus":{"bands":["18-25","26-35","36-45","46-55","PLAN:","500 Plus","18-25","26-35","36-45","46-55"],"tarifas":{"individual":[70098,104680,132407,200280,null,null,null,null,63437,94733],"individual+1":[140196,179451,198611,267040,null,null,null,null,126874,162399],"individual+2":[189265,231791,244954,313772,null,null,null,null,171280,209765],"matrimonio":[140196,209359,244954,360504,null,null,null,null,126874,189465],"matrimonio+1":[210294,284131,311157,427264,null,null,null,null,190311,257132],"matrimonio+2":[259363,336470,357500,473996,null,null,null,null,234717,304498],"adicional":[49069,52340,46343,46732,null,null,null,null,44406,47366],"adherente":[70098,104680,132407,200280,null,null,null,null,63437,94733]}},"1000":{"bands":["18-25","26-35","36-45","46-55","56-60","PLAN:","1000.0","18-25","26-35","36-45","46-55","56-60"],"tarifas":{"individual":[62553,87574,125105,187658,262721,null,null,null,56609,79252,113218,169826],"individual+1":[125105,150127,187658,250211,325274,null,null,null,113218,135861,169826,226435],"individual+2":[168892,193913,231445,293998,369061,null,null,null,152844,175487,209453,266061],"matrimonio":[125105,175148,231445,337785,499171,null,null,null,113218,158505,209453,305688],"matrimonio+1":[187658,237700,293998,400337,561723,null,null,null,169826,215113,266061,362296],"matrimonio+2":[231445,281487,337785,444124,605510,null,null,null,209453,254740,305688,401922],"adicional":[43787,43787,43787,43787,43787,null,null,null,39626,39626,39626,39626],"adherente":[62553,87574,125105,187658,262721,null,null,null,56609,79252,113218,169826]}},"2000":{"bands":["18-25","26-35","36-45","46-55","56-60","PLAN:","2000.0","18-25","26-35","36-45","46-55","56-60"],"tarifas":{"individual":[84702,118582,169403,254105,355747,null,null,null,76653,107314,153306,229959],"individual+1":[169403,203284,254105,338807,440449,null,null,null,153306,183968,229959,306613],"individual+2":[228695,262575,313396,398098,499740,null,null,null,206964,237625,283617,360270],"matrimonio":[169403,237165,313396,457389,675920,null,null,null,153306,214629,283617,413927],"matrimonio+1":[254105,321867,398098,542091,760622,null,null,null,229959,291282,360270,490580],"matrimonio+2":[313396,381158,457389,601382,819913,null,null,null,283617,344939,413927,544237],"adicional":[59291,59291,59291,59291,59291,null,null,null,53657,53657,53657,53657],"adherente":[84702,118582,169403,254105,355747,null,null,null,76653,107314,153306,229959]}},"3000":{"bands":["18-25","26-35","36-45","46-55","56-60","PLAN:","3000.0","18-25","26-35","36-45","46-55","56-60"],"tarifas":{"individual":[110988,155384,221977,332965,466152,null,null,null,100442,140619,200884,301326],"individual+1":[221977,266372,332965,443954,577140,null,null,null,200884,241061,301326,401768],"individual+2":[299669,344064,410657,521646,654832,null,null,null,271194,311370,371636,472078],"matrimonio":[221977,310768,410657,599338,885688,null,null,null,200884,281238,371636,542387],"matrimonio+1":[332965,421756,521646,710326,996677,null,null,null,301326,381680,472078,642829],"matrimonio+2":[410657,499448,599338,788018,null,null,null,null,371636,451989,542387,713139],"adicional":[77692,77692,77692,77692,77692,null,null,null,70309,70309,70309,70309],"adherente":[110988,155384,221977,332965,466152,null,null,null,100442,140619,200884,301326]}}};

function bandIdx(edad: number, bands: string[]): number | null {
  const b = edad <= 25 ? '18-25' : edad <= 35 ? '26-35' : edad <= 45 ? '36-45' : edad <= 55 ? '46-55' : edad <= 60 ? '56-60' : null;
  return b && bands.includes(b) ? bands.indexOf(b) : null;
}

const planes: Plan[] = [
  { id: '500 Plus', nombre: 'Plan 500 Plus', nivel: 1, descripcion: 'Plan base · Cobertura esencial', tarifas: { con_iva: null, sin_iva: null } },
  { id: '1000', nombre: 'Plan 1000', nivel: 2, descripcion: 'Cobertura media · Más prestadores', tarifas: { con_iva: null, sin_iva: null } },
  { id: '2000', nombre: 'Plan 2000', nivel: 3, descripcion: 'Cobertura completa · Sanatorios premium', tarifas: { con_iva: null, sin_iva: null } },
  { id: '3000', nombre: 'Plan 3000', nivel: 4, descripcion: 'Plan premium · Máxima cobertura', tarifas: { con_iva: null, sin_iva: null } },
];

export const doctored: Prepaga = {
  id: 'doctored',
  nombre: 'DOCTORED',
  vigencia: 'Julio 2026',
  zona: 'AMBA',
  color: '#00796B',
  activa: true,
  planes,

  getTramo(edad) {
    if (edad < 18) return 'menor18';
    if (edad <= 25) return '18-25';
    if (edad <= 35) return '26-35';
    if (edad <= 45) return '36-45';
    if (edad <= 55) return '46-55';
    if (edad <= 60) return '56-60';
    return null;
  },

  mapComp: {
    individual: 'individual', matrimonio: 'matrimonio',
    'ind+1': 'individual+1', 'ind+2': 'individual+2',
    'mat+1': 'matrimonio+1', 'mat+2': 'matrimonio+2',
    'mat+3': 'matrimonio+2', // matrimonio+2 + adicional por hijo extra
  },

  calcPrecio(plan, edad, compCanonica, _modalidad, grupo?: GrupoFamiliar): PrecioResult | null {
    const edadTit = grupo?.titular ?? edad;
    if (edadTit < 18) return { precio: null, nota: 'Doctored: edad mínima 18 años' };
    const dFull = FULL[plan.id];
    if (!dFull) return null;
    const ti = bandIdx(edadTit, dFull.bands);
    if (ti == null) return { precio: null, nota: 'Edad fuera de rango de lista — consultar' };

    const compKey = this.mapComp[compCanonica] as string;
    let precio = dFull.tarifas[compKey]?.[ti] ?? null;
    if (precio == null) return { precio: null, nota: 'No disponible' };

    const es3hijos = compCanonica === 'mat+3';
    let boniPrecio = BONI[plan.id]?.tarifas[compKey]?.[ti] ?? null;
    if (es3hijos) {
      const adic = dFull.tarifas['adicional_extra']?.[ti];
      if (adic != null) precio += adic;
      const adicB = BONI[plan.id]?.tarifas['adicional_extra']?.[ti];
      if (boniPrecio != null && adicB != null) boniPrecio += adicB;
    }

    const notas: string[] = [];
    if (es3hijos) notas.push('Incluye adicional 3er hijo');
    if (boniPrecio != null && boniPrecio < precio) {
      notas.push(`Tarifa bonificada: $${Math.round(boniPrecio).toLocaleString('es-AR')} (consultar condiciones)`);
    }
    return { precio: Math.round(precio), nota: notas.length ? notas.join(' · ') : null };
  },
};
