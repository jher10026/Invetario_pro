/* ===================================
   PÁGINA 404 - NOT FOUND
   Archivo: src/app/components/not-found/not-found.ts
   
   ✅ Página de error personalizada
   =================================== */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <!-- Ilustración -->
        <div class="illustration">
          <div class="number">4</div>
          <div class="icon">📦</div>
          <div class="number">4</div>
        </div>

        <!-- Texto -->
        <h1>Página no encontrada</h1>
        <p class="description">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        <!-- Sugerencias -->
        <div class="suggestions">
          <h3>¿Qué puedes hacer?</h3>
          <ul>
            <li>Verifica que la URL esté escrita correctamente</li>
            <li>Regresa a la página anterior</li>
            <li>Ve al inicio y navega desde allí</li>
          </ul>
        </div>

        <!-- Acciones -->
        <div class="actions">
          <button class="btn-primary" routerLink="/dashboard">
            🏠 Ir al Dashboard
          </button>
          <button class="btn-secondary" (click)="volver()">
            ← Volver atrás
          </button>
        </div>

        <!-- Enlaces rápidos -->
        <div class="quick-links">
          <span>Enlaces rápidos:</span>
          <a routerLink="/inventario">Inventario</a>
          <a routerLink="/categorias">Categorías</a>
          <a routerLink="/reportes">Reportes</a>
        </div>
      </div>

      <!-- Decoración -->
      <div class="decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .not-found-content {
      background: white;
      padding: 3rem;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
      max-width: 600px;
      position: relative;
      z-index: 10;
      animation: slideUp 0.6s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .illustration {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
      font-size: 5rem;
      font-weight: bold;
    }

    .number {
      color: #6366f1;
      text-shadow: 3px 3px 0 rgba(99, 102, 241, 0.2);
    }

    .icon {
      font-size: 4rem;
      animation: bounce 2s infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    h1 {
      font-size: 2rem;
      color: #1f2937;
      margin: 0 0 1rem 0;
    }

    .description {
      color: #6b7280;
      font-size: 1.125rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .suggestions {
      background: #f9fafb;
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      text-align: left;
    }

    .suggestions h3 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.125rem;
    }

    .suggestions ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #6b7280;
    }

    .suggestions li {
      margin-bottom: 0.5rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .btn-primary, .btn-secondary {
      padding: 1rem 2rem;
      border: none;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 1rem;
    }

    .btn-primary {
      background: #6366f1;
      color: white;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }

    .btn-primary:hover {
      background: #4f46e5;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }

    .btn-secondary:hover {
      background: #d1d5db;
      transform: translateY(-2px);
    }

    .quick-links {
      display: flex;
      gap: 1rem;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      color: #6b7280;
      font-size: 0.875rem;
    }

    .quick-links a {
      color: #6366f1;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s;
    }

    .quick-links a:hover {
      color: #4f46e5;
      text-decoration: underline;
    }

    /* Decoración de fondo */
    .decoration {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      animation: float 20s infinite ease-in-out;
    }

    .circle-1 {
      width: 300px;
      height: 300px;
      top: -100px;
      left: -100px;
      animation-delay: 0s;
    }

    .circle-2 {
      width: 200px;
      height: 200px;
      bottom: -50px;
      right: -50px;
      animation-delay: 5s;
    }

    .circle-3 {
      width: 150px;
      height: 150px;
      top: 50%;
      right: 10%;
      animation-delay: 10s;
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0) rotate(0deg);
      }
      50% {
        transform: translateY(-30px) rotate(180deg);
      }
    }

    @media (max-width: 640px) {
      .not-found-content {
        padding: 2rem;
      }

      .illustration {
        font-size: 3rem;
      }

      h1 {
        font-size: 1.5rem;
      }

      .actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class NotFound {
  volver(): void {
    window.history.back();
  }
}