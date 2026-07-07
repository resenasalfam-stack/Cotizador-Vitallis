import { asismed }      from './asismed';
import { asmepriv }     from './asmepriv';
import { bayresplan }   from './bayresplan';
import { contigo }      from './contigo';
import { cristal }      from './cristal';
import { doctored }     from './doctored';
import { formed }       from './formed';
import { galeno }       from './galeno';
import { hominis }      from './hominis';
import { medicardio }   from './medicardio';
import { medife }       from './medife';
import { omint }        from './omint';
import { osedaOspoce }  from './oseda_ospoce';
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
  cristal,
  doctored,
  formed,
  galeno,
  hominis,
  medicardio,
  medife,
  omint,
  osedaOspoce,
  premedic,
  saludCentral,
  swissMedical,
  // pmo_osde,       ← pendiente (PMO)
  // pmo_galeno,     ← pendiente (PMO)
];
