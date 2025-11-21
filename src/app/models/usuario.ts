export interface Usuario {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}