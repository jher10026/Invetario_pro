/* ===================================
   PIPE DE RESALTAR BÚSQUEDA
   Archivo: src/app/pipes/resaltar.pipe.ts
   =================================== */

import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'resaltar',
  standalone: true
})
export class ResaltarPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Resalta el término de búsqueda en un texto
   * @param texto - Texto original
   * @param termino - Término a resaltar
   * @returns HTML con el término resaltado
   */
  transform(texto: string, termino: string): SafeHtml {
    if (!termino || !texto) {
      return texto;
    }

    const regex = new RegExp(`(${termino})`, 'gi');
    const resultado = texto.replace(
      regex, 
      '<mark style="background: #fef3c7; padding: 2px 4px; border-radius: 3px;">$1</mark>'
    );

    return this.sanitizer.bypassSecurityTrustHtml(resultado);
  }
}