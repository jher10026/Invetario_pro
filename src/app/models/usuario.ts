export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'usuario';
  fechaRegistro: Date;
}