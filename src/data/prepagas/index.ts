import { premedic } from './premedic';
import { doctored } from './doctored';
import type { Prepaga } from '../../types';

// Para agregar una nueva prepaga:
// 1. Crear el archivo src/data/prepagas/<nombre>.ts siguiendo la misma estructura
// 2. Importarlo aquí y añadirlo al array PREPAGAS
export const PREPAGAS: Prepaga[] = [
  premedic,
  doctored,
  // hominis,       ← pendiente
  // swissMedical,  ← pendiente
  // medife,        ← pendiente
  // galeno,        ← pendiente
  // sancor,        ← pendiente
  // prevencion,    ← pendiente
  // saludCentral,  ← pendiente
  // cristal,       ← pendiente
  // osamoc,        ← pendiente
  // osdepym,       ← pendiente
  // luisPasteur,   ← pendiente
  // ras,           ← pendiente
];
