import { Injectable, inject } from '@angular/core';
import { 
  Storage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL,
  deleteObject
} from '@angular/fire/storage';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private storage = inject(Storage);

  private readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  private readonly MAX_SIZE = 5 * 1024 * 1024;

  validarArchivo(file: File): { valido: boolean; error?: string } {
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { 
        valido: false, 
        error: 'Solo se permiten imágenes (JPG, PNG, WEBP)' 
      };
    }

    if (file.size > this.MAX_SIZE) {
      return { 
        valido: false, 
        error: 'La imagen no debe superar 5MB' 
      };
    }

    return { valido: true };
  }

  subirImagen(
    file: File, 
    carpeta: string = 'productos'
  ): Observable<{ url?: string; progress?: number; error?: string }> {
    const subject = new Subject<{ url?: string; progress?: number; error?: string }>();

    const validacion = this.validarArchivo(file);
    if (!validacion.valido) {
      setTimeout(() => {
        subject.error(validacion.error);
        subject.complete();
      }, 0);
      return subject.asObservable();
    }

    const timestamp = Date.now();
    const nombre = `${timestamp}_${file.name.replace(/\s/g, '_')}`;
    const ruta = `${carpeta}/${nombre}`;

    const storageRef = ref(this.storage, ruta);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        subject.next({ progress });
      },
      (error) => {
        subject.error(this.manejarError(error));
        subject.complete();
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          subject.next({ url: downloadURL, progress: 100 });
          subject.complete();
        } catch (error) {
          subject.error('Error al obtener URL de la imagen');
          subject.complete();
        }
      }
    );

    return subject.asObservable();
  }

  async eliminarImagen(url: string): Promise<boolean> {
    try {
      const ruta = this.extraerRutaDeURL(url);
      if (!ruta) return false;

      const storageRef = ref(this.storage, ruta);
      await deleteObject(storageRef);
      
      return true;
    } catch (error) {
      console.error('❌ Error al eliminar imagen:', error);
      return false;
    }
  }

  private extraerRutaDeURL(url: string): string | null {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname.split('/o/')[1];
      return path ? decodeURIComponent(path.split('?')[0]) : null;
    } catch {
      return null;
    }
  }

  private manejarError(error: any): string {
    switch (error.code) {
      case 'storage/unauthorized':
        return 'No tienes permisos para subir imágenes';
      case 'storage/canceled':
        return 'Carga cancelada';
      default:
        return 'Error al subir la imagen';
    }
  }
}