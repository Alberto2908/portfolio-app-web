export interface Formacion {
  id?: string;
  nombre: string;
  centro: string;
  nombreEn?: string;
  mesInicio: string;
  anoInicio: number;
  cursandoAhora: boolean;
  mesFin?: string;
  anoFin?: number;
}
