/* ===================================
   PIPE DE FORMATO DE MONEDA PERUANA
   Archivo: src/app/pipes/moneda-pe.pipe.ts
   =================================== */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'monedaPe',
  standalone: true
})
export class MonedaPePipe implements PipeTransform {
  /**
   * Formatea números como moneda peruana
   * @param value - Valor numérico
   * @param simbolo - Mostrar símbolo o no
   * @returns Valor formateado como S/ XX,XXX.XX
   */
  transform(value: number, simbolo: boolean = true): string {
    if (value === null || value === undefined) {
      return simbolo ? 'S/ 0.00' : '0.00';
    }

    const formateado = value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return simbolo ? `S/ ${formateado}` : formateado;
  }
}