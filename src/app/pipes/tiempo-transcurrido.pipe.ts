/* ===================================
   PIPE DE TIEMPO TRANSCURRIDO
   Archivo: src/app/pipes/tiempo-transcurrido.pipe.ts
   =================================== */

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoTranscurrido',
  standalone: true
})
export class TiempoTranscurridoPipe implements PipeTransform {
  /**
   * Convierte una fecha en texto de tiempo transcurrido
   * @param fecha - Fecha en formato string (YYYY-MM-DD)
   * @returns Texto como "hace 3 días" o "hace 2 meses"
   */
  transform(fecha: string): string {
    const fechaProducto = new Date(fecha);
    const ahora = new Date();
    
    // Calcular diferencia en milisegundos
    const diferencia = ahora.getTime() - fechaProducto.getTime();
    
    // Convertir a unidades de tiempo
    const segundos = Math.floor(diferencia / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    const semanas = Math.floor(dias / 7);
    const meses = Math.floor(dias / 30);
    const años = Math.floor(dias / 365);

    // Retornar texto apropiado
    if (años > 0) {
      return años === 1 ? 'hace 1 año' : `hace ${años} años`;
    } else if (meses > 0) {
      return meses === 1 ? 'hace 1 mes' : `hace ${meses} meses`;
    } else if (semanas > 0) {
      return semanas === 1 ? 'hace 1 semana' : `hace ${semanas} semanas`;
    } else if (dias > 0) {
      return dias === 1 ? 'hace 1 día' : `hace ${dias} días`;
    } else if (horas > 0) {
      return horas === 1 ? 'hace 1 hora' : `hace ${horas} horas`;
    } else if (minutos > 0) {
      return minutos === 1 ? 'hace 1 minuto' : `hace ${minutos} minutos`;
    } else {
      return 'hace unos segundos';
    }
  }
}