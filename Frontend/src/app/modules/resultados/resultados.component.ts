import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { EjerciciosService } from 'app/core/ejercicios/ejercicios.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatTabsModule
  ],
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss']
})
export class ResultadosComponent implements OnInit, OnDestroy {
  resultados: any[] = [];
  detallesResultado: { [key: string]: any[] } = {};
  user!: User;
  cargando = true;
  expandedResultados: { [key: string]: boolean } = {};
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private ejerciciosService: EjerciciosService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: User) => {
        this.user = user;
      });

    this.obtenerResultados();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  obtenerResultados(): void {
    this.cargando = true;
    this.ejerciciosService.obtenerResultadosUsuario().subscribe({
      next: (data: any) => {
        this.resultados = data || [];
        console.log('Resultados obtenidos:', this.resultados);
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error al obtener resultados:', error);
        this.cargando = false;
      }
    });
  }

  toggleResultado(id: string): void {
    if (this.expandedResultados[id]) {
      this.expandedResultados[id] = false;
    } else {
      this.expandedResultados[id] = true;
      // Cargar detalles si no están disponibles
      if (!this.detallesResultado[id]) {
        this.cargarDetalles(id);
      }
    }
  }

  cargarDetalles(intentoId: string): void {
    this.ejerciciosService.obtenerDetallesResultado(intentoId).subscribe({
      next: (data: any) => {
        this.detallesResultado[intentoId] = data || [];
        console.log('Detalles del intento:', this.detallesResultado[intentoId]);
      },
      error: (error: any) => {
        console.error('Error al obtener detalles:', error);
      }
    });
  }

  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${minutos}m ${secs}s`;
  }

  formatearFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  volverAEjercicios(): void {
    this.router.navigate(['/ejercicios']);
  }

  getColorBadge(color: string): string {
    const colorMap: { [key: string]: string } = {
      'verde': 'bg-green-600',
      'amarillo': 'bg-yellow-400',
      'rojo': 'bg-red-600',
      'negro': 'bg-black'
    };
    return colorMap[color] || 'bg-gray-400';
  }
}
