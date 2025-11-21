export interface Reporte {
  id: number;
  usuario: string;
  email: string;
  tipo: 'error-stock' | 'error-datos' | 'bug' | 'mejora' | 'consulta' | 'otro';
  descripcion: string;
  fecha: string;  // ISO string
}
