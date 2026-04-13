import type { Prepaga, Plan, PrecioResult } from '../../types';

const planes: Plan[] = [
  {
    id: 'd500p', nombre: 'Plan 500 Plus', nivel: 1,
    descripcion: 'Plan base · Cobertura esencial',
    tarifas: {
      con_iva: {
        '18-25': { individual: 86541,  matrimonio: 173081, 'ind+1': 173081, 'ind+2': 233660, 'mat+1': 259622, 'mat+2': 320200 },
        '25-35': { individual: 121157, matrimonio: 242314, 'ind+1': 207697, 'ind+2': 268276, 'mat+1': 328854, 'mat+2': 389433 },
        '36-45': { individual: 144234, matrimonio: 266834, 'ind+1': 216352, 'ind+2': 266834, 'mat+1': 338951, 'mat+2': 389433 },
        '46-55': { individual: 185444, matrimonio: 333799, 'ind+1': 247259, 'ind+2': 290529, 'mat+1': 395614, 'mat+2': 438884 },
        '56-60': { individual: 201928, matrimonio: 383663, 'ind+1': 250006, 'ind+2': 283661, 'mat+1': 431741, 'mat+2': 465396 },
        '61-69': { individual: 225006, matrimonio: 438761, 'ind+1': 268276, 'ind+2': 298565, 'mat+1': 482031, 'mat+2': 512320 },
        '70-79': { individual: 259622, matrimonio: 519244, 'ind+1': 302892, 'ind+2': 333181, 'mat+1': 562514, 'mat+2': 592803 },
      },
      sin_iva: {
        '18-25': { individual: 78317,  matrimonio: 156635, 'ind+1': 156635, 'ind+2': 211457, 'mat+1': 234952, 'mat+2': 289774 },
        '25-35': { individual: 109644, matrimonio: 219288, 'ind+1': 187961, 'ind+2': 242784, 'mat+1': 297606, 'mat+2': 352428 },
        '36-45': { individual: 130529, matrimonio: 241478, 'ind+1': 195793, 'ind+2': 241478, 'mat+1': 306743, 'mat+2': 352428 },
        '46-55': { individual: 167823, matrimonio: 302081, 'ind+1': 223764, 'ind+2': 262922, 'mat+1': 358022, 'mat+2': 397181 },
        '56-60': { individual: 182740, matrimonio: 347207, 'ind+1': 226250, 'ind+2': 256707, 'mat+1': 390716, 'mat+2': 421173 },
        '61-69': { individual: 203625, matrimonio: 397069, 'ind+1': 242784, 'ind+2': 270195, 'mat+1': 436227, 'mat+2': 463638 },
        '70-79': { individual: 234952, matrimonio: 469904, 'ind+1': 274111, 'ind+2': 301522, 'mat+1': 509062, 'mat+2': 536473 },
      },
    },
    adicional_3hijos: { con_iva: 60578, sin_iva: 54822 },
  },
  {
    id: 'd1000', nombre: 'Plan 1000', nivel: 2,
    descripcion: 'Cobertura media · Más prestadores',
    tarifas: {
      con_iva: {
        '18-25': { individual: 115838, matrimonio: 231676, 'ind+1': 231676, 'ind+2': 312763, 'mat+1': 347515, 'mat+2': 428601 },
        '25-35': { individual: 162174, matrimonio: 324347, 'ind+1': 278012, 'ind+2': 359098, 'mat+1': 440185, 'mat+2': 521272 },
        '36-45': { individual: 193064, matrimonio: 357168, 'ind+1': 289596, 'ind+2': 357168, 'mat+1': 453700, 'mat+2': 521272 },
        '46-55': { individual: 248225, matrimonio: 446805, 'ind+1': 330966, 'ind+2': 388885, 'mat+1': 529546, 'mat+2': 587465 },
        '56-60': { individual: 270289, matrimonio: 513549, 'ind+1': 334644, 'ind+2': 379692, 'mat+1': 577904, 'mat+2': 622952 },
        '61-69': { individual: 301179, matrimonio: 587300, 'ind+1': 359098, 'ind+2': 399642, 'mat+1': 645219, 'mat+2': 685762 },
        '70-79': { individual: 347515, matrimonio: 695029, 'ind+1': 405434, 'ind+2': 445977, 'mat+1': 752948, 'mat+2': 793492 },
      },
      sin_iva: {
        '18-25': { individual: 104831, matrimonio: 209662, 'ind+1': 209662, 'ind+2': 283044, 'mat+1': 314493, 'mat+2': 387875 },
        '25-35': { individual: 146763, matrimonio: 293527, 'ind+1': 251594, 'ind+2': 324976, 'mat+1': 398358, 'mat+2': 471739 },
        '36-45': { individual: 174718, matrimonio: 323229, 'ind+1': 262077, 'ind+2': 323229, 'mat+1': 410588, 'mat+2': 471739 },
        '46-55': { individual: 224638, matrimonio: 404348, 'ind+1': 299517, 'ind+2': 351933, 'mat+1': 479227, 'mat+2': 531643 },
        '56-60': { individual: 244606, matrimonio: 464751, 'ind+1': 302845, 'ind+2': 343613, 'mat+1': 522990, 'mat+2': 563758 },
        '61-69': { individual: 272561, matrimonio: 531493, 'ind+1': 324976, 'ind+2': 361667, 'mat+1': 583908, 'mat+2': 620599 },
        '70-79': { individual: 314493, matrimonio: 628986, 'ind+1': 366908, 'ind+2': 403599, 'mat+1': 681401, 'mat+2': 718092 },
      },
    },
    adicional_3hijos: { con_iva: 81087, sin_iva: 73382 },
  },
  {
    id: 'd2000', nombre: 'Plan 2000', nivel: 3,
    descripcion: 'Cobertura completa · Sanatorios premium',
    tarifas: {
      con_iva: {
        '18-25': { individual: 156855, matrimonio: 313710, 'ind+1': 313710, 'ind+2': 423508, 'mat+1': 470565, 'mat+2': 580363 },
        '25-35': { individual: 219597, matrimonio: 439194, 'ind+1': 376452, 'ind+2': 486250, 'mat+1': 596048, 'mat+2': 705847 },
        '36-45': { individual: 261425, matrimonio: 483636, 'ind+1': 392137, 'ind+2': 483636, 'mat+1': 614348, 'mat+2': 705847 },
        '46-55': { individual: 336118, matrimonio: 605012, 'ind+1': 448157, 'ind+2': 526584, 'mat+1': 717051, 'mat+2': 795478 },
        '56-60': { individual: 365995, matrimonio: 695390, 'ind+1': 453136, 'ind+2': 514135, 'mat+1': 782531, 'mat+2': 843530 },
        '61-69': { individual: 407823, matrimonio: 795254, 'ind+1': 486250, 'ind+2': 541149, 'mat+1': 873681, 'mat+2': 928581 },
        '70-79': { individual: 470565, matrimonio: 941129, 'ind+1': 548992, 'ind+2': 603891, 'mat+1': 1019556, 'mat+2': 1074456 },
      },
      sin_iva: {
        '18-25': { individual: 141950, matrimonio: 283900, 'ind+1': 283900, 'ind+2': 383265, 'mat+1': 425850, 'mat+2': 525215 },
        '25-35': { individual: 198730, matrimonio: 397460, 'ind+1': 340680, 'ind+2': 440045, 'mat+1': 539410, 'mat+2': 638775 },
        '36-45': { individual: 236583, matrimonio: 437679, 'ind+1': 354875, 'ind+2': 437679, 'mat+1': 555971, 'mat+2': 638775 },
        '46-55': { individual: 304179, matrimonio: 547522, 'ind+1': 405572, 'ind+2': 476547, 'mat+1': 648915, 'mat+2': 719890 },
        '56-60': { individual: 331217, matrimonio: 629312, 'ind+1': 410078, 'ind+2': 465281, 'mat+1': 708173, 'mat+2': 763376 },
        '61-69': { individual: 369070, matrimonio: 719687, 'ind+1': 440045, 'ind+2': 489728, 'mat+1': 790662, 'mat+2': 840345 },
        '70-79': { individual: 425850, matrimonio: 851701, 'ind+1': 496825, 'ind+2': 546508, 'mat+1': 922676, 'mat+2': 972358 },
      },
    },
    adicional_3hijos: { con_iva: 109798, sin_iva: 99365 },
  },
  {
    id: 'd3000', nombre: 'Plan 3000', nivel: 4,
    descripcion: 'Plan premium · Máxima cobertura',
    tarifas: {
      con_iva: {
        '18-25': { individual: 205534, matrimonio: 411068, 'ind+1': 411068, 'ind+2': 554942, 'mat+1': 616602, 'mat+2': 760476 },
        '25-35': { individual: 287748, matrimonio: 575495, 'ind+1': 493281, 'ind+2': 637155, 'mat+1': 781029, 'mat+2': 924903 },
        '36-45': { individual: 342557, matrimonio: 633730, 'ind+1': 513835, 'ind+2': 633730, 'mat+1': 805008, 'mat+2': 924903 },
        '46-55': { individual: 440430, matrimonio: 792774, 'ind+1': 587240, 'ind+2': 690007, 'mat+1': 939584, 'mat+2': 1042351 },
        '56-60': { individual: 479579, matrimonio: 911200, 'ind+1': 593765, 'ind+2': 673695, 'mat+1': 1025386, 'mat+2': 1105316 },
        '61-69': { individual: 534388, matrimonio: 1042057, 'ind+1': 637155, 'ind+2': 709092, 'mat+1': 1144824, 'mat+2': 1216761 },
        '70-79': { individual: 616602, matrimonio: 1233204, 'ind+1': 719369, 'ind+2': 791306, 'mat+1': 1335971, 'mat+2': 1407907 },
      },
      sin_iva: {
        '18-25': { individual: 186004, matrimonio: 372007, 'ind+1': 372007, 'ind+2': 502210, 'mat+1': 558011, 'mat+2': 688213 },
        '25-35': { individual: 260405, matrimonio: 520810, 'ind+1': 446409, 'ind+2': 576611, 'mat+1': 706814, 'mat+2': 837016 },
        '36-45': { individual: 310006, matrimonio: 573511, 'ind+1': 465009, 'ind+2': 573511, 'mat+1': 728514, 'mat+2': 837016 },
        '46-55': { individual: 398579, matrimonio: 717442, 'ind+1': 531439, 'ind+2': 624441, 'mat+1': 850302, 'mat+2': 943304 },
        '56-60': { individual: 434008, matrimonio: 824616, 'ind+1': 537344, 'ind+2': 609678, 'mat+1': 927951, 'mat+2': 1000286 },
        '61-69': { individual: 483609, matrimonio: 943038, 'ind+1': 576611, 'ind+2': 641712, 'mat+1': 1036040, 'mat+2': 1101141 },
        '70-79': { individual: 558011, matrimonio: 1116021, 'ind+1': 651012, 'ind+2': 716114, 'mat+1': 1209023, 'mat+2': 1274124 },
      },
    },
    adicional_3hijos: { con_iva: 143874, sin_iva: 130202 },
  },
];

export const doctored: Prepaga = {
  id: 'doctored',
  nombre: 'Doctored',
  vigencia: 'Abril 2026',
  zona: 'AMBA',
  color: '#00796B',
  activa: true,
  planes,

  getTramo(edad) {
    if (edad < 18)               return 'menor18';
    if (edad >= 18 && edad <= 25) return '18-25';
    if (edad > 25  && edad <= 35) return '25-35';
    if (edad > 35  && edad <= 45) return '36-45';
    if (edad > 45  && edad <= 55) return '46-55';
    if (edad > 55  && edad <= 60) return '56-60';
    if (edad > 60  && edad <= 69) return '61-69';
    if (edad > 69  && edad <= 79) return '70-79';
    return null;
  },

  mapComp: {
    individual: 'individual',
    matrimonio: 'matrimonio',
    'ind+1':    'ind+1',
    'ind+2':    'ind+2',
    'mat+1':    'mat+1',
    'mat+2':    'mat+2',
    'mat+3':    'mat+2', // usa mat+2 + adicional_3hijos
  },

  calcPrecio(plan, edad, compCanonica, modalidad): PrecioResult | null {
    const tramo = this.getTramo(edad);
    if (!tramo) return null;
    if (tramo === 'menor18') return { precio: null, nota: 'Doctored: edad mínima 18 años' };

    const usaIVA  = modalidad === 'particular';
    const tablaKey = usaIVA ? 'con_iva' : 'sin_iva';
    const tabla = plan.tarifas[tablaKey];
    if (!tabla) return null;

    const compKey  = this.mapComp[compCanonica];
    const es3hijos = compCanonica === 'mat+3';

    const t = tabla[tramo];
    if (!t) return null;
    let precio = t[compKey as string];
    if (precio === undefined) return { precio: null, nota: 'No disponible' };

    let nota: string | null = null;
    if (es3hijos && plan.adicional_3hijos) {
      const adicional = plan.adicional_3hijos[tablaKey as 'con_iva' | 'sin_iva'] ?? 0;
      precio += adicional;
      nota = `Incluye adicional 3er hijo ($${Math.round(adicional).toLocaleString('es-AR')})`;
    }
    return { precio, nota };
  },
};
