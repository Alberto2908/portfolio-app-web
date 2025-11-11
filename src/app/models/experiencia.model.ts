export interface Experiencia {
  id?: string;
  empresa: string;
  puesto?: string;
  descripcion: string;
  puestoEn?: string;
  descripcionEn?: string;
  mesInicio: string;
  anoInicio: number;
  trabajoActivo: boolean;
  mesFin?: string;
  anoFin?: number;
}
