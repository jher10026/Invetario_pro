/* ===================================
   SERVICIO DE IMGBB
   Archivo: src/app/services/imgbb.service.ts
   
   ✅ Sube imágenes a ImgBB y retorna URL
   =================================== */

import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class ImgbbService {
    private readonly API_KEY = '4be6996bd3dca1f5519c3a46ef04e595';
    private readonly API_URL = 'https://api.imgbb.com/1/upload';

    constructor() {
        console.log('🖼️ ImgBB Service inicializado');
    }

    /**
     * Subir imagen a ImgBB
     * @param file Archivo de imagen a subir
     * @returns URL de la imagen subida o null si falla
     */
    async subirImagen(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
        try {
            console.log('📤 Subiendo imagen a ImgBB:', file.name);

            // Validar tipo de archivo
            if (!file.type.startsWith('image/')) {
                return { success: false, error: 'El archivo debe ser una imagen' };
            }

            // Validar tamaño (máximo 32MB para ImgBB)
            const maxSize = 32 * 1024 * 1024; // 32MB
            if (file.size > maxSize) {
                return { success: false, error: 'La imagen es muy grande (máximo 32MB)' };
            }

            // Convertir archivo a base64
            const base64 = await this.fileToBase64(file);

            // Crear FormData para la API
            const formData = new FormData();
            formData.append('key', this.API_KEY);
            formData.append('image', base64);

            // Hacer petición a ImgBB
            const response = await fetch(this.API_URL, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                console.log('✅ Imagen subida exitosamente:', data.data.url);
                return {
                    success: true,
                    url: data.data.url
                };
            } else {
                console.error('❌ Error de ImgBB:', data);
                return {
                    success: false,
                    error: data.error?.message || 'Error al subir imagen'
                };
            }

        } catch (error: any) {
            console.error('❌ Error al subir imagen:', error);
            return {
                success: false,
                error: error.message || 'Error de conexión'
            };
        }
    }

    /**
     * Convertir archivo a base64
     */
    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                // Remover el prefijo "data:image/...;base64,"
                const base64 = (reader.result as string).split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }

    /**
     * Validar si la URL es una imagen válida
     */
    esUrlValida(url: string): boolean {
        if (!url) return false;
        const extensionesValidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const urlLower = url.toLowerCase();
        return extensionesValidas.some(ext => urlLower.includes(ext)) ||
            url.includes('imgbb.com') ||
            url.includes('i.ibb.co');
    }
}
