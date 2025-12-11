/* ===================================
   PIPE DE ESTADO DE STOCK
   Archivo: src/app/pipes/stock-estado.pipe.ts
   =================================== */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stockEstado',
  standalone: true
})
export class StockEstadoPipe implements PipeTransform {
  /**
   * Transforma un número de stock en un texto descriptivo
   * @param stock - Cantidad en stock
   * @returns Texto descriptivo del estado
   */
  transform(stock: number): string {
    if (stock === 0) {
      return '🔴 AGOTADO';
    } else if (stock < 10) {
      return `🟡 STOCK BAJO (${stock})`;
    } else if (stock < 50) {
      return `🟢 DISPONIBLE (${stock})`;
    } else {
      return `🟢 EN STOCK (${stock})`;
    }
  }
}