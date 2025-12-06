/* ===================================
   COMPONENTE DE UPLOAD DE IMÁGENES
   Archivo: src/app/components/image-upload/image-upload.component.ts
   
   ✅ Drag & Drop
   ✅ Preview de imagen
   ✅ Barra de progreso
   =================================== */

import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadService } from '../../services/image-upload.service';
import { NotificationService } from '../../services/notification.service';
import { fadeInOut, slideUp } from '../../config/animations';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  animations: [fadeInOut, slideUp],
  template: `
    <div class="image-upload-container">
      <!-- Zona de Drop -->
      <div 
        class="drop-zone"
        [class.dragging]="isDragging"
        [class.uploading]="uploading"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input 
          #fileInput
          type="file" 
          accept="image/*"
          (change)="onFileSelected($event)"
          style="display: none"
        >

        <!-- Preview de imagen -->
        <div *ngIf="previewUrl && !uploading" @fadeInOut class="preview-container">
          <img [src]="previewUrl" alt="Preview" class="preview-image">
          <button class="remove-btn" (click)="removeImage($event)">×</button>
        </div>

        <!-- Estado de carga -->
        <div *ngIf="uploading" @slideUp class="upload-state">
          <div class="spinner"></div>
          <p class="upload-text">Subiendo imagen...</p>
          <div class="progress-bar">
            <div class="progress-fill" [style.width.%]="uploadProgress"></div>
          </div>
          <p class="progress-text">{{ uploadProgress }}%</p>
        </div>

        <!-- Estado inicial -->
        <div *ngIf="!previewUrl && !uploading" @fadeInOut class="empty-state">
          <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          <p class="drop-text">Arrastra una imagen o haz clic</p>
          <p class="drop-hint">JPG, PNG o WEBP (Max 5MB)</p>
        </div>
      </div>

      <!-- Botón de subida -->
      <button 
        *ngIf="selectedFile && !uploading"
        @slideUp
        class="upload-btn"
        (click)="uploadImage()"
      >
        📤 Subir Imagen
      </button>
    </div>
  `,
  styles: [`
    .image-upload-container {
      width: 100%;
    }

    .drop-zone {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s;
      background: #f8fafc;
      position: relative;
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drop-zone:hover {
      border-color: #3b82f6;
      background: #eff6ff;
    }

    .drop-zone.dragging {
      border-color: #3b82f6;
      background: #dbeafe;
      transform: scale(1.02);
    }

    .drop-zone.uploading {
      pointer-events: none;
    }

    .preview-container {
      position: relative;
      width: 100%;
      max-width: 300px;
    }

    .preview-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .remove-btn {
      position: absolute;
      top: -10px;
      right: -10px;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #ef4444;
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: all 0.2s;
    }

    .remove-btn:hover {
      background: #dc2626;
      transform: scale(1.1);
    }

    .upload-state {
      width: 100%;
      max-width: 300px;
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .upload-text {
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 16px;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #2563eb);
      transition: width 0.3s;
      border-radius: 4px;
    }

    .progress-text {
      font-size: 14px;
      color: #6b7280;
    }

    .empty-state {
      width: 100%;
    }

    .upload-icon {
      width: 64px;
      height: 64px;
      color: #9ca3af;
      margin: 0 auto 16px;
    }

    .drop-text {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin-bottom: 8px;
    }

    .drop-hint {
      font-size: 14px;
      color: #6b7280;
    }

    .upload-btn {
      width: 100%;
      padding: 12px;
      margin-top: 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .upload-btn:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
    }
  `]
})
export class ImageUploadComponent {
  @Input() carpeta: string = 'productos';
  @Output() imagenSubida = new EventEmitter<string>();

  isDragging = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploading = false;
  uploadProgress = 0;

  constructor(
    private imageUploadService: ImageUploadService,
    private notificationService: NotificationService
  ) {}

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  private handleFile(file: File): void {
    const validation = this.imageUploadService.validarArchivo(file);
    
    if (!validation.valido) {
      this.notificationService.error('Archivo Inválido', validation.error || '');
      return;
    }

    this.selectedFile = file;
    
    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    if (!this.selectedFile) return;

    this.uploading = true;
    this.uploadProgress = 0;

    this.imageUploadService.subirImagen(this.selectedFile, this.carpeta)
      .subscribe({
        next: (result) => {
          if (result.progress !== undefined) {
            this.uploadProgress = result.progress;
          }
          
          if (result.url) {
            this.notificationService.imagenSubida();
            this.imagenSubida.emit(result.url);
            this.resetForm();
          }
        },
        error: (error) => {
          this.notificationService.errorImagen(error);
          this.uploading = false;
        }
      });
  }

  removeImage(event: Event): void {
    event.stopPropagation();
    this.resetForm();
  }

  private resetForm(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.uploading = false;
    this.uploadProgress = 0;
  }
}