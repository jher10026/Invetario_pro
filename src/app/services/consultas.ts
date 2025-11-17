import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Consulta } from '../models/consulta';

@Injectable({
  providedIn: 'root'
})
export class ConsultasService {
  private consultasSubject = new BehaviorSubject<Consulta[]>([]);
  public consultas$ = this.consultasSubject.asObservable();

  constructor() {
    this.cargarConsultas();
  }

  private cargarConsultas(): void {
    const consultasGuardadas = localStorage.getItem('consultas');
    if (consultasGuardadas) {
      const consultas = JSON.parse(consultasGuardadas);
      this.consultasSubject.next(consultas);
    }
  }

  private guardarConsultas(consultas: Consulta[]): void {
    localStorage.setItem('consultas', JSON.stringify(consultas));
    this.consultasSubject.next(consultas);
  }

  obtenerConsultas(): Consulta[] {
    return this.consultasSubject.value;
  }

  crearConsulta(usuarioId: string, usuarioNombre: string, mensaje: string): Consulta {
    const consultas = this.obtenerConsultas();
    
    const nuevaConsulta: Consulta = {
      id: this.generarId(),
      usuarioId,
      usuarioNombre,
      mensaje,
      fecha: new Date(),
      leida: false
    };

    consultas.push(nuevaConsulta);
    this.guardarConsultas(consultas);
    
    return nuevaConsulta;
  }

  marcarComoLeida(id: string): void {
    const consultas = this.obtenerConsultas();
    const consulta = consultas.find(c => c.id === id);
    
    if (consulta) {
      consulta.leida = true;
      this.guardarConsultas(consultas);
    }
  }

  obtenerConsultasNoLeidas(): Consulta[] {
    return this.obtenerConsultas().filter(c => !c.leida);
  }

  private generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}