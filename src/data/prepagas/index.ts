import { asismed }      from './asismed';
import { asmepriv }     from './asmepriv';
import { bayresplan }   from './bayresplan';
import { contigo }      from './contigo';
import { formed }       from './formed';
import { medicardio }   from './medicardio';
import { premedic }     from './premedic';
import { saludCentral } from './salud_central';
import { swissMedical } from './swiss_medical';
import type { Prepaga } from '../../types';

// Para agregar una nueva prepaga:
// 1. Crear el archivo src/data/prepagas/<nombre>.ts siguiendo la estructura existente
// 2. Importarlo aquí y añadirlo al array PREPAGAS
export const PREPAGAS: Prepaga[] = [
  asismed,
  asmepriv,
  bayresplan,
  contigo,
  formed,
  medicardio,
  premedic,
  saludCentral,
  swissMedical,
  // pmo_osde,       ← pendiente (PMO)
  // pmo_galeno,     ← pendiente (PMO)
  // superador_osde, ← pendiente (SUPERADOR)
];
