export interface Composicion {
  key: string;
  label: string;
  icon: string;
}

export interface Modalidad {
  key: string;
  icon: string;
  label: string;
  sub: string;
}

export interface Tarifa {
  [tramo: string]: {
    [comp: string]: number;
  };
}

export interface Prestaciones {
  internacion?: string;
  urgencias?: string;
  estudios?: string;
  medicamentos?: string;
  saludMental?: string;
  maternidad?: string;
  odontologia?: string;
  optica?: string;
  carencias?: string;
  copagos?: string;
  telemedicina?: string;
  farmacias?: string;
  guardias?: string;
  cartilla?: string;
  clinicas?: string;
}

export interface Plan {
  id: string;
  nombre: string;
  nivel: number;
  descripcion: string;
  tarifas: {
    con_iva: Tarifa | null;
    sin_iva: Tarifa | null;
  };
  adicional_3hijos?: { con_iva: number; sin_iva: number };
  recargo60_64?: { r1: number; r2: number } | null;
  mayor65?: string;
  prestaciones?: Prestaciones;
}

export interface PrecioResult {
  precio: number | null;
  nota: string | null;
}

export interface ResultadoPlan extends Plan {
  res: (PrecioResult & { neto: number | null; aporte: number }) | null;
}

export interface Prepaga {
  id: string;
  nombre: string;
  vigencia: string;
  zona: string;
  color: string;
  activa: boolean;
  planes: Plan[];
  getTramo: (edad: number) => string | null;
  mapComp: Record<string, string | null>;
  calcPrecio: (
    plan: Plan,
    edad: number,
    comp: string,
    modalidad: string
  ) => PrecioResult | null;
}

export interface ResultadoPrepaga extends Omit<Prepaga, 'planes' | 'getTramo' | 'mapComp' | 'calcPrecio'> {
  planesCalc: ResultadoPlan[];
}

export interface LeadData {
  nombre: string;
  email: string;
  telefono: string;
  edad: number;
  composicion: string;
  modalidad: string;
  planInteres: string;
  prepagaInteres: string;
  precioMensual: number | null;
  fecha: string;
  origen: string;
}
