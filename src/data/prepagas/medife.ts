import type { Prepaga, Plan, PrecioResult, GrupoFamiliar } from '../../types';

// MEDIFÉ — AMBA — JULIO 2026 (cotizador oficial Medifé del Drive, hoja Resumen LP)
// obligatorio = con derivación de aportes (dependencia / monotributo) · voluntario = particular directo
// Precio per cápita: titular/esposo por banda [0-25, 26-35, 36-40, 41-50, 51-60, 61-65, 66+] + hijos.

type Filas = { titular: Record<string, number|null>[]; esposo: Record<string, number|null>[]; hijo_0_1: Record<string, number|null>; hijo_2_20: Record<string, number|null>; hijo_21_29: Record<string, number|null> };
const OBLIGATORIO: Filas = {"titular":[{"INDIE":133749,"MEDIFE+":149908,"BRONCE CLASSIC":176362,"BRONCE 250":207484,"PLATA 450":267505,"ORO 450":375577,"PLATINUM 450":488251},{"INDIE":139322,"MEDIFE+":149908,"BRONCE CLASSIC":176362,"BRONCE 250":207484,"PLATA 450":267505,"ORO 450":375577,"PLATINUM 450":488251},{"INDIE":164957,"MEDIFE+":166883,"BRONCE CLASSIC":196334,"BRONCE 250":230982,"PLATA 450":336073,"ORO 450":471847,"PLATINUM 450":613402},{"INDIE":240132,"MEDIFE+":173496,"BRONCE CLASSIC":204113,"BRONCE 250":240132,"PLATA 450":367315,"ORO 450":515711,"PLATINUM 450":670426},{"INDIE":358932,"MEDIFE+":259328,"BRONCE CLASSIC":305092,"BRONCE 250":358932,"PLATA 450":526266,"ORO 450":738877,"PLATINUM 450":960541},{"INDIE":622453,"MEDIFE+":449723,"BRONCE CLASSIC":529085,"BRONCE 250":622453,"PLATA 450":802516,"ORO 450":1126732,"PLATINUM 450":1464752},{"INDIE":622453,"MEDIFE+":449723,"BRONCE CLASSIC":529085,"BRONCE 250":622453,"PLATA 450":802516,"ORO 450":1126732,"PLATINUM 450":1464752}],"esposo":[{"INDIE":120374,"MEDIFE+":134917,"BRONCE CLASSIC":158726,"BRONCE 250":186736,"PLATA 450":240755,"ORO 450":338020,"PLATINUM 450":439426},{"INDIE":125390,"MEDIFE+":134917,"BRONCE CLASSIC":158726,"BRONCE 250":186736,"PLATA 450":240755,"ORO 450":338020,"PLATINUM 450":439426},{"INDIE":148461,"MEDIFE+":150195,"BRONCE CLASSIC":176700,"BRONCE 250":207883,"PLATA 450":302466,"ORO 450":424662,"PLATINUM 450":552061},{"INDIE":216119,"MEDIFE+":156147,"BRONCE CLASSIC":183702,"BRONCE 250":216119,"PLATA 450":330584,"ORO 450":464140,"PLATINUM 450":603383},{"INDIE":323039,"MEDIFE+":233396,"BRONCE CLASSIC":274583,"BRONCE 250":323039,"PLATA 450":473639,"ORO 450":664990,"PLATINUM 450":864487},{"INDIE":560207,"MEDIFE+":404750,"BRONCE CLASSIC":476177,"BRONCE 250":560207,"PLATA 450":722264,"ORO 450":1014059,"PLATINUM 450":1318277},{"INDIE":560207,"MEDIFE+":404750,"BRONCE CLASSIC":476177,"BRONCE 250":560207,"PLATA 450":722264,"ORO 450":1014059,"PLATINUM 450":1318277}],"hijo_0_1":{"INDIE":207484,"MEDIFE+":149908,"BRONCE CLASSIC":176362,"BRONCE 250":207484,"PLATA 450":267505,"ORO 450":375577,"PLATINUM 450":488251},"hijo_2_20":{"INDIE":207484,"MEDIFE+":149908,"BRONCE CLASSIC":176362,"BRONCE 250":207484,"PLATA 450":267505,"ORO 450":375577,"PLATINUM 450":488251},"hijo_21_29":{"INDIE":207484,"MEDIFE+":149908,"BRONCE CLASSIC":176362,"BRONCE 250":207484,"PLATA 450":267505,"ORO 450":375577,"PLATINUM 450":488251}};
const VOLUNTARIO: Filas = {"titular":[{"INDIE":222089,"MEDIFE+":167047,"BRONCE CLASSIC":196526,"BRONCE 250":231224,"PLATA 450":286334,"ORO 450":402014,"PLATINUM 450":522618},{"INDIE":222089,"MEDIFE+":167047,"BRONCE CLASSIC":196526,"BRONCE 250":231224,"PLATA 450":286334,"ORO 450":402014,"PLATINUM 450":522618},{"INDIE":247240,"MEDIFE+":185964,"BRONCE CLASSIC":218781,"BRONCE 250":247240,"PLATA 450":359729,"ORO 450":505059,"PLATINUM 450":656578},{"INDIE":257035,"MEDIFE+":193333,"BRONCE CLASSIC":227451,"BRONCE 250":257035,"PLATA 450":393171,"ORO 450":552014,"PLATINUM 450":717616},{"INDIE":384198,"MEDIFE+":288979,"BRONCE CLASSIC":326543,"BRONCE 250":384198,"PLATA 450":563308,"ORO 450":790886,"PLATINUM 450":1028151},{"INDIE":666266,"MEDIFE+":481343,"BRONCE CLASSIC":566285,"BRONCE 250":693673,"PLATA 450":859003,"ORO 450":1206042,"PLATINUM 450":1567855},{"INDIE":666266,"MEDIFE+":501143,"BRONCE CLASSIC":589579,"BRONCE 250":693673,"PLATA 450":859003,"ORO 450":1206042,"PLATINUM 450":1567855}],"esposo":[{"INDIE":199880,"MEDIFE+":150343,"BRONCE CLASSIC":176874,"BRONCE 250":208101,"PLATA 450":257701,"ORO 450":361813,"PLATINUM 450":470357},{"INDIE":199880,"MEDIFE+":150343,"BRONCE CLASSIC":176874,"BRONCE 250":208101,"PLATA 450":257701,"ORO 450":361813,"PLATINUM 450":470357},{"INDIE":222516,"MEDIFE+":167368,"BRONCE CLASSIC":196903,"BRONCE 250":222516,"PLATA 450":323756,"ORO 450":454553,"PLATINUM 450":590920},{"INDIE":231331,"MEDIFE+":174000,"BRONCE CLASSIC":204706,"BRONCE 250":231331,"PLATA 450":353853,"ORO 450":496812,"PLATINUM 450":645854},{"INDIE":345778,"MEDIFE+":260081,"BRONCE CLASSIC":293888,"BRONCE 250":345778,"PLATA 450":506977,"ORO 450":711797,"PLATINUM 450":925336},{"INDIE":599640,"MEDIFE+":433209,"BRONCE CLASSIC":509657,"BRONCE 250":624306,"PLATA 450":773103,"ORO 450":1085438,"PLATINUM 450":1411070},{"INDIE":599640,"MEDIFE+":451029,"BRONCE CLASSIC":530621,"BRONCE 250":624306,"PLATA 450":773103,"ORO 450":1085438,"PLATINUM 450":1411070}],"hijo_0_1":{"INDIE":222089,"MEDIFE+":167047,"BRONCE CLASSIC":196526,"BRONCE 250":231224,"PLATA 450":286334,"ORO 450":402014,"PLATINUM 450":522618},"hijo_2_20":{"INDIE":222089,"MEDIFE+":167047,"BRONCE CLASSIC":196526,"BRONCE 250":231224,"PLATA 450":286334,"ORO 450":402014,"PLATINUM 450":522618},"hijo_21_29":{"INDIE":222089,"MEDIFE+":167047,"BRONCE CLASSIC":196526,"BRONCE 250":231224,"PLATA 450":286334,"ORO 450":402014,"PLATINUM 450":522618}};

function bandIdx(edad: number): number {
  if (edad <= 25) return 0;
  if (edad <= 35) return 1;
  if (edad <= 40) return 2;
  if (edad <= 50) return 3;
  if (edad <= 60) return 4;
  if (edad <= 65) return 5;
  return 6;
}

const planes: Plan[] = [
  { id: 'INDIE', nombre: 'Plan Indie', nivel: 1, descripcion: 'Plan joven individual · Digital', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'MEDIFE+', nombre: 'Plan Medifé+', nivel: 1, descripcion: 'Cobertura esencial Medifé', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'BRONCE CLASSIC', nombre: 'Plan Bronce Classic', nivel: 2, descripcion: 'Cobertura base · Cartilla Medifé', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'BRONCE 250', nombre: 'Plan Bronce', nivel: 2, descripcion: 'Cobertura amplia · Copagos reducidos', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'PLATA 450', nombre: 'Plan Plata', nivel: 3, descripcion: 'Sin copagos · Habitación individual', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'ORO 450', nombre: 'Plan Oro', nivel: 4, descripcion: 'Reintegros altos · Red premium', tarifas: { con_iva: null, sin_iva: null } },
  { id: 'PLATINUM 450', nombre: 'Plan Platinum', nivel: 5, descripcion: 'Plan top Medifé · Máxima cobertura', tarifas: { con_iva: null, sin_iva: null } },
];

export const medife: Prepaga = {
  id: 'medife',
  nombre: 'MEDIFÉ',
  vigencia: 'Julio 2026',
  zona: 'AMBA',
  color: '#6CC24A',
  activa: true,
  planes,

  getTramo(edad) { return String(bandIdx(edad)); },

  mapComp: {
    individual: 'individual', matrimonio: 'matrimonio',
    'ind+1': 'ind+1', 'ind+2': 'ind+2',
    'mat+1': 'mat+1', 'mat+2': 'mat+2', 'mat+3': 'mat+3',
  },

  calcPrecio(plan, edad, compCanonica, modalidad, grupo?: GrupoFamiliar): PrecioResult | null {
    if (plan.id === 'INDIE' && compCanonica !== 'individual') return null;
    const t = modalidad === 'particular' ? VOLUNTARIO : OBLIGATORIO;
    const edadTit = grupo?.titular ?? edad;
    let precio = t.titular[bandIdx(edadTit)]?.[plan.id] ?? null;
    if (precio == null) return { precio: null, nota: 'No disponible' };

    if (compCanonica.startsWith('mat')) {
      const pe = t.esposo[bandIdx(grupo?.conyuge ?? edadTit)]?.[plan.id];
      if (pe == null) return { precio: null, nota: 'No disponible para el cónyuge' };
      precio += pe;
    }
    const nHijos = compCanonica.endsWith('+1') ? 1 : compCanonica.endsWith('+2') ? 2 : compCanonica.endsWith('+3') ? 3 : 0;
    for (let i = 0; i < nHijos; i++) {
      const eh = grupo?.hijos[i];
      const fila = eh != null && eh >= 21 ? t.hijo_21_29 : eh != null && eh <= 1 ? t.hijo_0_1 : t.hijo_2_20;
      const ph = fila?.[plan.id];
      if (ph == null) return { precio: null, nota: 'Hijo fuera de rango — consultar' };
      precio += ph;
    }
    const nota = modalidad === 'particular' ? 'Voluntario (particular directo)' : 'Con derivación de aportes';
    return { precio: Math.round(precio), nota };
  },
};
