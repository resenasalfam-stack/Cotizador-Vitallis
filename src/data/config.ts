import type { Composicion, Modalidad } from '../types';

export const CFG = {
  mono_titular:   21988,
  mono_adherente: 21988,
  dep_empleado:   0.03,
  dep_empleador:  0.06,
};

// URL del webhook de GoHighLevel — configurar en .env como VITE_GHL_WEBHOOK
export const GHL_WEBHOOK = import.meta.env.VITE_GHL_WEBHOOK ?? '';

// Contraseña del panel de administración — configurar en .env como VITE_ADMIN_PASSWORD
export const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? 'vitallis2026';

export const COMPOSICIONES: Composicion[] = [
  { key: 'individual', label: 'Solo yo',                icon: '🧑' },
  { key: 'ind+1',      label: 'Yo + 1 hijo',           icon: '🧑‍👦' },
  { key: 'ind+2',      label: 'Yo + 2 hijos',          icon: '🧑‍👦‍👦' },
  { key: 'matrimonio', label: 'Yo + cónyuge',          icon: '👫' },
  { key: 'mat+1',      label: 'Yo + cónyuge + 1 hijo', icon: '👨‍👩‍👦' },
  { key: 'mat+2',      label: 'Yo + cónyuge + 2 hijos',icon: '👨‍👩‍👧‍👦' },
  { key: 'mat+3',      label: 'Yo + cónyuge + 3 hijos',icon: '👪' },
];

export const MODS: Modalidad[] = [
  { key: 'dependencia', icon: '🏢', label: 'Relación de dependencia', sub: 'Tengo recibo de sueldo' },
  { key: 'monotributo', icon: '📋', label: 'Monotributista',          sub: 'Pago monotributo mensual' },
  { key: 'particular',  icon: '👤', label: 'Particular / Directo',    sub: 'Sin aportes ni recibo de sueldo' },
];
