/* ===================================
   SERVICIO DE REPORTES
   Archivo: src/app/services/reportes.service.ts
   =================================== */

import { Injectable, signal } from '@angular/core';
import { Reporte } from '../models/reporte.model';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private reportesSignal = signal<Reporte[]>([]);
  public reportes = this.reportesSignal.asReadonly();

  constructor(private storageService: StorageService) {
    this.cargarReportes();
  }

  /**
   * Cargar reportes del storage
   */
  private cargarReportes(): void {
    const reportesGuardados = this.storageService.obtenerReportes<Reporte>([]);
    this.reportesSignal.set(reportesGuardados);
  }

  /**
   * Obtener todos los reportes
   */
  obtenerTodos(): Reporte[] {
    return this.reportesSignal();
  }

  /**
   * Crear nuevo reporte
   */
  crear(reporte: Omit<Reporte, 'id'>): Reporte {
    const nuevoReporte: Reporte = {
      id: Date.now(),
      ...reporte
    };

    const actuales = this.reportesSignal();
    this.reportesSignal.set([...actuales, nuevoReporte]);
    this.guardarEnStorage();

    return nuevoReporte;
  }

  /**
   * Eliminar reporte
   */
  eliminar(id: number): boolean {
    const actuales = this.reportesSignal();
    const index = actuales.findIndex(r => r.id === id);

    if (index === -1) {
      return false;
    }

    actuales.splice(index, 1);
    this.reportesSignal.set([...actuales]);
    this.guardarEnStorage();

    return true;
  }

  /**
   * Obtener reportes por tipo
   */
  filtrarPorTipo(tipo: string): Reporte[] {
    return this.reportesSignal().filter(r => r.tipo === tipo);
  }

  /**
   * Contar reportes por tipo
   */
  contarPorTipo(tipo: string): number {
    return this.reportesSignal().filter(r => r.tipo === tipo).length;
  }

  /**
   * Guardar en storage
   */
  private guardarEnStorage(): void {
    this.storageService.guardarReportes(this.reportesSignal());
  }
}