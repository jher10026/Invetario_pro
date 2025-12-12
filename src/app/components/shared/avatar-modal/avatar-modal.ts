/* ===================================
   COMPONENTE AVATAR MODAL
   Archivo: src/app/components/shared/avatar-modal/avatar-modal.ts
   
   ✅ Modal para subir/cambiar foto de perfil con ImgBB
   =================================== */

import { Component, EventEmitter, Input, Output, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImgbbService } from '../../../services/imgbb.service';
import { FirebaseService } from '../../../services/firebase.service';

@Component({
  selector: 'app-avatar-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './avatar-modal.html',
  styleUrl: './avatar-modal.css'
})
export class AvatarModal {
  @Input() visible = false;
  @Input() currentPhotoURL?: string;
  @Input() iniciales = 'U';
  @Output() cerrar = new EventEmitter<void>();
  @Output() fotoActualizada = new EventEmitter<string | null>();

  private imgbbService = inject(ImgbbService);
  private firebaseService = inject(FirebaseService);

  // Estados
  subiendo = signal(false);
  error = signal('');
  previewURL = signal<string | null>(null);
  archivoSeleccionado = signal<File | null>(null);

  // Manejar selección de archivo
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        this.error.set('Por favor selecciona una imagen');
        return;
      }

      // Validar tamaño (máx 5MB para una imagen de perfil)
      if (file.size > 5 * 1024 * 1024) {
        this.error.set('La imagen es muy grande (máximo 5MB)');
        return;
      }

      this.error.set('');
      this.archivoSeleccionado.set(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewURL.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  // Subir imagen
  async subirImagen(): Promise<void> {
    const file = this.archivoSeleccionado();
    if (!file) {
      this.error.set('Selecciona una imagen primero');
      return;
    }

    this.subiendo.set(true);
    this.error.set('');

    try {
      // Subir a ImgBB
      const resultado = await this.imgbbService.subirImagen(file);

      if (resultado.success && resultado.url) {
        // Actualizar en Firebase
        const resultadoFirebase = await this.firebaseService.actualizarFotoPerfil(resultado.url);

        if (resultadoFirebase.success) {
          this.fotoActualizada.emit(resultado.url);
          this.cerrarModal();
        } else {
          this.error.set(resultadoFirebase.message);
        }
      } else {
        this.error.set(resultado.error || 'Error al subir imagen');
      }
    } catch (err: any) {
      this.error.set(err.message || 'Error al procesar imagen');
    } finally {
      this.subiendo.set(false);
    }
  }

  // Eliminar foto actual
  async eliminarFoto(): Promise<void> {
    this.subiendo.set(true);
    this.error.set('');

    try {
      const resultado = await this.firebaseService.eliminarFotoPerfil();

      if (resultado.success) {
        this.fotoActualizada.emit(null);
        this.cerrarModal();
      } else {
        this.error.set(resultado.message);
      }
    } catch (err: any) {
      this.error.set(err.message || 'Error al eliminar foto');
    } finally {
      this.subiendo.set(false);
    }
  }

  // Cerrar modal
  cerrarModal(): void {
    this.previewURL.set(null);
    this.archivoSeleccionado.set(null);
    this.error.set('');
    this.cerrar.emit();
  }

  // Abrir selector de archivos
  abrirSelector(): void {
    const input = document.getElementById('avatar-file-input') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }
}
