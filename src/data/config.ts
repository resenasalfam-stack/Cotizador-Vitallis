import type { Composicion, Modalidad } from '../types';

export const CFG = {
  mono_titular:   21988, // fallback si no hay categoría seleccionada
  mono_adherente: 21988,
  dep_empleado:   0.03,
  dep_empleador:  0.06,
};

// Aportes obra social por categoría — vigente desde 01/02/2026 (ARCA/AFIP)
export interface CategoriaMono {
  key: string;
  label: string;
  aporteObraSocial: number;
}

export const CATEGORIAS_MONO: CategoriaMono[] = [
  { key: 'A', label: 'Categoría A', aporteObraSocial: 15616 },
  { key: 'B', label: 'Categoría B', aporteObraSocial: 17178 },
  { key: 'C', label: 'Categoría C', aporteObraSocial: 18896 },
  { key: 'D', label: 'Categoría D', aporteObraSocial: 20785 },
  { key: 'E', label: 'Categoría E', aporteObraSocial: 22864 },
  { key: 'F', label: 'Categoría F', aporteObraSocial: 25150 },
  { key: 'G', label: 'Categoría G', aporteObraSocial: 35210 },
  { key: 'H', label: 'Categoría H', aporteObraSocial: 49294 },
  { key: 'I', label: 'Categoría I', aporteObraSocial: 69012 },
  { key: 'J', label: 'Categoría J', aporteObraSocial: 96616 },
  { key: 'K', label: 'Categoría K', aporteObraSocial: 135263 },
];

// URL del webhook de GoHighLevel — configurar en .env como VITE_GHL_WEBHOOK
export const GHL_WEBHOOK = import.meta.env.VITE_GHL_WEBHOOK ?? '';

// Contraseña del panel de administración — configurar en .env como VITE_ADMIN_PASSWORD
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'vitallis2026';

export const COMPOSICIONES: Composicion[] = [
  { key: 'individual', label: 'Individual',             icon: '🧑' },
  { key: 'ind+1',      label: 'Titular + 1 hijo',      icon: '🧑‍👦' },
  { key: 'ind+2',      label: 'Titular + 2 hijos',     icon: '🧑‍👦‍👦' },
  { key: 'matrimonio', label: 'Titular + cónyuge',     icon: '👫' },
  { key: 'mat+1',      label: 'Grupo familiar (2+1)',  icon: '👨‍👩‍👦' },
  { key: 'mat+2',      label: 'Grupo familiar (2+2)',  icon: '👨‍👩‍👧‍👦' },
  { key: 'mat+3',      label: 'Grupo familiar (2+3)',  icon: '👪' },
];

export const MODS: Modalidad[] = [
  { key: 'dependencia', icon: '🏢', label: 'Relación de dependencia', sub: 'Tengo recibo de sueldo' },
  { key: 'monotributo', icon: '📋', label: 'Monotributista',          sub: 'Pago monotributo mensual' },
  { key: 'particular',  icon: '👤', label: 'Particular / Directo',    sub: 'Sin aportes ni recibo de sueldo' },
];
