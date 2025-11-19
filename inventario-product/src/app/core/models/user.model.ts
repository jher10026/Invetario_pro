export interface User {
  username: string;
  password: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}