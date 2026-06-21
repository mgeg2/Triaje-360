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
import { Subject, takeUntil, forkJoin, map, tap, Observable } from 'rxjs';
import { EjerciciosService } from 'app/core/ejercicios/ejercicios.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  pacientesPorIntento: { [key: string]: any[] } = {};
  intentoId: { [key: string]: any } = {};
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
    this.intentoId[intentoId] = intentoId;
    this.obtenerPacientesIntento(intentoId);
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

  /**
   * Genera y descarga un PDF con los detalles del intento
   */
 descargarPDF(intento: any): void {
  const intentoId = String(intento.id);

  forkJoin({
    pacientes: this.obtenerPacientesIntento(intentoId),
    detalles: this.obtenerDetallesIntento(intentoId)
  }).subscribe({
    next: () => {
      try {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let yPosition = 10;

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(
          `${intento.ejercicio_nombre} - Intento #${intento.numero_intento}`,
          pageWidth / 2,
          yPosition,
          { align: 'center' }
        );

        yPosition += 8;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(
          this.formatearFecha(intento.created_at),
          pageWidth / 2,
          yPosition,
          { align: 'center' }
        );

        yPosition += 10;

        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');

        const infoTexts = [
          `Asignatura: ${intento.asignatura_nombre || 'N/A'}`,
          `Tiempo realizado: ${this.formatearTiempo(intento.tiempo_realizado)}`,
          `Total de acciones: ${intento.total_acciones}`
        ];

        infoTexts.forEach((text) => {
          doc.text(text, 10, yPosition);
          yPosition += 7;
        });

        yPosition += 5;

        doc.setFont('helvetica', 'bold');
        doc.text('Descripción:', 10, yPosition);

        yPosition += 5;

        doc.setFont('helvetica', 'normal');

        const descripcionLines = doc.splitTextToSize(
          intento.ejercicio_descripcion || 'N/A',
          pageWidth - 20
        );

        doc.text(descripcionLines, 10, yPosition);

        yPosition += descripcionLines.length * 5 + 10;

        const estadisticas = this.calcularEstadisticasPacientes(intentoId);

        console.log('Estadísticas para PDF:', estadisticas);

        // Aquí ya puedes activar tus tablas
         yPosition = this.agregarTablaTriage(doc, yPosition, estadisticas);
        
        yPosition = this.agregarTablaSobretraje(doc, yPosition, estadisticas);
        yPosition = this.agregarTablaInfratraje(doc, yPosition, estadisticas);
        // this.agregarTablaMortalidad(doc, yPosition, estadisticas);

        const nombreArchivo = `Intento_${intento.id}_${intento.ejercicio_nombre.replace(/\s+/g, '_')}.pdf`;

        doc.save(nombreArchivo);

        console.log('PDF descargado:', nombreArchivo);

      } catch (error) {
        console.error('Error al generar PDF:', error);
      }
    },
    error: (error: any) => {
      console.error('Error al cargar datos para el PDF:', error);
    }
  });
}
 
  

  // /**
  //  * Agrega tabla TRIAGE 1ª al PDF
  //  */
   private agregarTablaTriage(doc: any, yPosition: number, estadisticas: any): number {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TRIAGE 1ª', 10, yPosition);
    yPosition += 8;

    const tableData = [
      ['Color', 'Nº en Ejercicio', 'Nº Triados', '% Triados'],
      [
        'NEGRO',
        estadisticas.negro.total.toString(),
        estadisticas.negro.triado.toString(),
        estadisticas.negro.total > 0 ? ((estadisticas.negro.triado / estadisticas.negro.total) * 100).toFixed(2) + '%' : '0%'
      ],
      [
        'ROJO',
        estadisticas.rojo.total.toString(),
        estadisticas.rojo.triado.toString(),
        estadisticas.rojo.total > 0 ? ((estadisticas.rojo.triado / estadisticas.rojo.total) * 100).toFixed(2) + '%' : '0%'
      ],
      [
        'AMARILLO',
        estadisticas.amarillo.total.toString(),
        estadisticas.amarillo.triado.toString(),
        estadisticas.amarillo.total > 0 ? ((estadisticas.amarillo.triado / estadisticas.amarillo.total) * 100).toFixed(2) + '%' : '0%'
      ],
      [
        'VERDE',
        estadisticas.verde.total.toString(),
        estadisticas.verde.triado.toString(),
        estadisticas.verde.total > 0 ? ((estadisticas.verde.triado / estadisticas.verde.total) * 100).toFixed(2) + '%' : '0%'
      ]
    ];

    autoTable(doc, {
      head: [tableData[0]],
      body: tableData.slice(1),
      startY: yPosition,
      margin: { left: 10, right: 10 },
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  
  /**
   * Agrega tabla SOBRETRAJE al PDF
   */
private agregarTablaSobretraje(doc: any, yPosition: number, estadisticas: any): number {
  if (yPosition > 250) {
    doc.addPage();
    yPosition = 10;
  }

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SOBRETRIAJE', 10, yPosition);
  yPosition += 8;

  const verdesSobretriados = estadisticas.sobretriaje.verdesTriadosAmarilloORojo;
  const amarillosSobretriados = estadisticas.sobretriaje.amarillosTriadosRojo;
  const totalSobretriados = estadisticas.sobretriaje.totalSobretriados;

  const totalVerdes = estadisticas.verde.total;
  const totalAmarillos = estadisticas.amarillo.total;
  const totalVerdesAmarillos = estadisticas.sobretriaje.totalVerdesAmarillos;

  const porcentajeVerdes =
    totalVerdes > 0
      ? ((verdesSobretriados / totalVerdes) * 100).toFixed(2) + '%'
      : '0%';

  const porcentajeAmarillos =
    totalAmarillos > 0
      ? ((amarillosSobretriados / totalAmarillos) * 100).toFixed(2) + '%'
      : '0%';

  const porcentajeTotal =
    totalVerdesAmarillos > 0
      ? ((totalSobretriados / totalVerdesAmarillos) * 100).toFixed(2) + '%'
      : '0%';

  const tableData = [
    ['Concepto', 'Número', '%'],
    [
      'Verdes triados como amarillo o rojo',
      verdesSobretriados.toString(),
      porcentajeVerdes
    ],
    [
      'Amarillos triados como rojo',
      amarillosSobretriados.toString(),
      porcentajeAmarillos
    ],
    [
      'Total sobretriaje',
      totalSobretriados.toString(),
      porcentajeTotal
    ]
  ];

  autoTable(doc, {
    head: [tableData[0]],
    body: tableData.slice(1),
    startY: yPosition,
    margin: { left: 10, right: 10 },
    headStyles: {
      fillColor: [255, 255, 0],
      textColor: [0, 0, 0],
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: [0, 0, 0]
    }
  });

  return (doc as any).lastAutoTable.finalY + 10;
}

  /**
   * Agrega tabla INFRATRIAJE al PDF
   */
  private agregarTablaInfratraje(doc: any, yPosition: number, estadisticas: any): number {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 10;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFRATRIAJE', 10, yPosition);
    yPosition += 8;

    const rojosInfratriados = estadisticas.infratriaje.rojosTriadosAmarilloOVerde;
    const amarillosInfratriados = estadisticas.infratriaje.amarillosTriadosVerde;
    const totalInfratriados = estadisticas.infratriaje.totalInfratriados;

    const totalRojos = estadisticas.rojo.total;
    const totalAmarillos = estadisticas.amarillo.total;
    const totalRojosAmarillos = estadisticas.infratriaje.totalRojosAmarillos;

    const porcentajeRojos =
      totalRojos > 0
        ? ((rojosInfratriados / totalRojos) * 100).toFixed(2) + '%'
        : '0%';

    const porcentajeAmarillos =
      totalAmarillos > 0
        ? ((amarillosInfratriados / totalAmarillos) * 100).toFixed(2) + '%'
        : '0%';

    const porcentajeTotal =
      totalRojosAmarillos > 0
        ? ((totalInfratriados / totalRojosAmarillos) * 100).toFixed(2) + '%'
        : '0%';

    const tableData = [
      ['Concepto', 'Número', '%'],
      [
        'Rojos triados como amarillo o verde',
        rojosInfratriados.toString(),
        porcentajeRojos
      ],
      [
        'Amarillos triados como verde',
        amarillosInfratriados.toString(),
        porcentajeAmarillos
      ],
      [
        'Total infratriaje',
        totalInfratriados.toString(),
        porcentajeTotal
      ]
    ];

    autoTable(doc, {
      head: [tableData[0]],
      body: tableData.slice(1),
      startY: yPosition,
      margin: { left: 10, right: 10 },
      headStyles: {
        fillColor: [255, 165, 0],
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      bodyStyles: {
        textColor: [0, 0, 0]
      }
    });

    return (doc as any).lastAutoTable.finalY + 10;
  }

  /**
   * Agrega tabla MORTALIDAD EVITABLE al PDF
   */
  // private agregarTablaMortalidad(doc: any, yPosition: number, estadisticas: any): void {
  //   // Verificar si hay espacio en la página
  //   if (yPosition > 250) {
  //     doc.addPage();
  //     yPosition = 10;
  //   }

  //   doc.setFontSize(12);
  //   doc.setFont('helvetica', 'bold');
  //   doc.text('MORTALIDAD EVITABLE', 10, yPosition);
  //   yPosition += 8;

  //   const tableData = [
  //     ['Concepto', 'Descripción'],
  //     ['Negros Evitables', 'Pacientes que pasaron de verde/amarillo/rojo a negro durante el ejercicio'],
  //     ['Estado Final', 'Los pacientes que terminaron en color negro después del triaje']
  //   ];

  //   autoTable(doc, {
  //     head: [tableData[0]],
  //     body: tableData.slice(1),
  //     startY: yPosition,
  //     margin: { left: 10, right: 10 },
  //     headStyles: {
  //       fillColor: [0, 0, 0],
  //       textColor: [255, 255, 255],
  //       fontStyle: 'bold'
  //     },
  //     bodyStyles: {
  //       textColor: [0, 0, 0]
  //     }
  //   });
  // }

private calcularEstadisticasPacientes(intentoId: string): any {
  const acciones = this.detallesResultado[intentoId] || [];
  const pacientes = this.pacientesPorIntento[intentoId] || [];

  const coloresValidos = ['negro', 'rojo', 'amarillo', 'verde'];

  const contadores: { [key: string]: any } = {
    negro: { triado: 0, total: 0 },
    rojo: { triado: 0, total: 0 },
    amarillo: { triado: 0, total: 0 },
    verde: { triado: 0, total: 0 },
    sobretriaje: {
      verdesTriadosAmarilloORojo: 0,
      amarillosTriadosRojo: 0,
      totalSobretriados: 0,
      totalVerdesAmarillos: 0
    },
    infratriaje: {
      rojosTriadosAmarilloOVerde: 0,
      amarillosTriadosVerde: 0,
      totalInfratriados: 0,
      totalRojosAmarillos: 0
    }
  };

  const pacientesPorId = new Map<string, any>();
  const colorAsignadoPorPaciente = new Map<string, string>();

  pacientes.forEach((paciente: any) => {
    const pacienteId = String(
      paciente.id ??
      paciente.paciente_id ??
      paciente.pacienteId ??
      paciente.id_paciente ??
      ''
    );

    let colorOriginal = String(paciente.color ?? '').trim().toLowerCase();

    if (!coloresValidos.includes(colorOriginal)) {
      colorOriginal = 'verde';
    }

    contadores[colorOriginal].total++;

    if (pacienteId) {
      pacientesPorId.set(pacienteId, {
        ...paciente,
        colorOriginal
      });
    }
  });

  acciones.forEach((accion: any) => {
    const accionPacienteId =
      accion.paciente_id ??
      accion.pacienteId ??
      accion.id_paciente ??
      accion.paciente?.id ??
      (
        typeof accion.paciente === 'string' || typeof accion.paciente === 'number'
          ? accion.paciente
          : ''
      );

    const pacienteId = String(accionPacienteId ?? '');

    let colorAsignado = String(accion.color_asignado ?? '').trim().toLowerCase();

    if (!coloresValidos.includes(colorAsignado)) {
      colorAsignado = 'verde';
    }

    if (pacienteId) {
      colorAsignadoPorPaciente.set(pacienteId, colorAsignado);
    }
  });

  colorAsignadoPorPaciente.forEach((colorAsignado: string, pacienteId: string) => {
    contadores[colorAsignado].triado++;

    const paciente = pacientesPorId.get(pacienteId);

    if (!paciente) {
      return;
    }

    const colorOriginal = paciente.colorOriginal;

    if (
      colorOriginal === 'verde' &&
      (colorAsignado === 'amarillo' || colorAsignado === 'rojo')
    ) {
      contadores.sobretriaje.verdesTriadosAmarilloORojo++;
    }

    if (
      colorOriginal === 'amarillo' &&
      colorAsignado === 'rojo'
    ) {
      contadores.sobretriaje.amarillosTriadosRojo++;
    }

    if (
      colorOriginal === 'rojo' &&
      (colorAsignado === 'amarillo' || colorAsignado === 'verde')
    ) {
      contadores.infratriaje.rojosTriadosAmarilloOVerde++;
    }

    if (
      colorOriginal === 'amarillo' &&
      colorAsignado === 'verde'
    ) {
      contadores.infratriaje.amarillosTriadosVerde++;
    }
  });

  contadores.sobretriaje.totalSobretriados =
    contadores.sobretriaje.verdesTriadosAmarilloORojo +
    contadores.sobretriaje.amarillosTriadosRojo;

  contadores.sobretriaje.totalVerdesAmarillos =
    contadores.verde.total +
    contadores.amarillo.total;

  contadores.infratriaje.totalInfratriados =
    contadores.infratriaje.rojosTriadosAmarilloOVerde +
    contadores.infratriaje.amarillosTriadosVerde;

  contadores.infratriaje.totalRojosAmarillos =
    contadores.rojo.total +
    contadores.amarillo.total;

  console.log('Estadísticas calculadas:', contadores);

  return contadores;
}
   obtenerPacientesIntento(intentoId: string): Observable<any[]> {
  return this.ejerciciosService.getPacientesByIntento(intentoId).pipe(
    map((data: any) => {
      console.log('Respuesta completa pacientes:', data);

      if (Array.isArray(data)) {
        return data;
      }

      return data?.pacientes || [];
    }),
    tap((pacientes: any[]) => {
      this.pacientesPorIntento[intentoId] = pacientes;
      console.log('Pacientes del intento:', pacientes);
    })
  );
}
  obtenerDetallesIntento(intentoId: string) {
  return this.ejerciciosService.obtenerDetallesResultado(intentoId).pipe(
    map((data: any) => {
      if (Array.isArray(data)) {
        return data;
      }

      return data?.detalles || data?.acciones || [];
    }),
    tap((detalles: any[]) => {
      this.detallesResultado[intentoId] = detalles;
      console.log('Detalles del intento:', detalles);
    })
  );
}
}
// export class ResultadosComponent implements OnInit, OnDestroy {
//   resultados: any[] = [];
//   detallesResultado: { [key: string]: any[] } = {};
//   pacientesPorIntento: { [key: string]: any[] } = {};
//   intentoId: { [key: string]: any } = {};
//   user!: User;
//   cargando = true;
//   expandedResultados: { [key: string]: boolean } = {};
//   private _unsubscribeAll: Subject<any> = new Subject<any>();

//   constructor(
//     private ejerciciosService: EjerciciosService,
//     private userService: UserService,
//     private router: Router
//   ) {}

//   ngOnInit(): void {
//     this.userService.user$
//       .pipe(takeUntil(this._unsubscribeAll))
//       .subscribe((user: User) => {
//         this.user = user;
//       });

//     this.obtenerResultados();
//   }

//   ngOnDestroy(): void {
//     this._unsubscribeAll.next(null);
//     this._unsubscribeAll.complete();
//   }

//   obtenerResultados(): void {
//     this.cargando = true;
//     this.ejerciciosService.obtenerResultadosUsuario().subscribe({
//       next: (data: any) => {
      
       
//         this.resultados = data || [];
//         console.log('Resultados obtenidos:', this.resultados);
//         this.cargando = false;
//       },
//       error: (error: any) => {
//         console.error('Error al obtener resultados:', error);
//         this.cargando = false;
//       }
//     });
//   }

//   toggleResultado(id: string): void {
//     if (this.expandedResultados[id]) {
//       this.expandedResultados[id] = false;
//     } else {
//       this.expandedResultados[id] = true;
//       // Cargar detalles si no están disponibles
//       if (!this.detallesResultado[id]) {
//         this.cargarDetalles(id);
//       }
//     }
//   }

//   cargarDetalles(intentoId: string): void {
//     this.intentoId[intentoId] = intentoId;
//     this.obtenerPacientesIntento(intentoId);
//     this.ejerciciosService.obtenerDetallesResultado(intentoId).subscribe({
//       next: (data: any) => {
//         this.detallesResultado[intentoId] = data || [];
//         console.log('Detalles del intento:', this.detallesResultado[intentoId]);
//       },
//       error: (error: any) => {
//         console.error('Error al obtener detalles:', error);
//       }
//     });
//   }

 

//   formatearTiempo(segundos: number): string {
//     const minutos = Math.floor(segundos / 60);
//     const secs = segundos % 60;
//     return `${minutos}m ${secs}s`;
//   }

//   formatearFecha(fecha: string): string {
//     return new Date(fecha).toLocaleDateString('es-ES', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   }

//   volverAEjercicios(): void {
//     this.router.navigate(['/ejercicios']);
//   }

//   getColorBadge(color: string): string {
//     const colorMap: { [key: string]: string } = {
//       'verde': 'bg-green-600',
//       'amarillo': 'bg-yellow-400',
//       'rojo': 'bg-red-600',
//       'negro': 'bg-black'
//     };
//     return colorMap[color] || 'bg-gray-400';
//   }

//   /**
//    * Genera y descarga un PDF con los detalles del intento
//    */
//  descargarPDF(intento: any): void {
//   const intentoId = String(intento.id);

//   forkJoin({
//     pacientes: this.obtenerPacientesIntento(intentoId),
//     detalles: this.obtenerDetallesIntento(intentoId)
//   }).subscribe({
//     next: () => {
//       try {
//         const doc = new jsPDF();
//         const pageWidth = doc.internal.pageSize.getWidth();
//         let yPosition = 10;

//         doc.setFontSize(16);
//         doc.setFont('helvetica', 'bold');
//         doc.text(
//           `${intento.ejercicio_nombre} - Intento #${intento.numero_intento}`,
//           pageWidth / 2,
//           yPosition,
//           { align: 'center' }
//         );

//         yPosition += 8;

//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'normal');
//         doc.text(
//           this.formatearFecha(intento.created_at),
//           pageWidth / 2,
//           yPosition,
//           { align: 'center' }
//         );

//         yPosition += 10;

//         doc.setFontSize(11);
//         doc.setFont('helvetica', 'normal');

//         const infoTexts = [
//           `Asignatura: ${intento.asignatura_nombre || 'N/A'}`,
//           `Tiempo realizado: ${this.formatearTiempo(intento.tiempo_realizado)}`,
//           `Total de acciones: ${intento.total_acciones}`
//         ];

//         infoTexts.forEach((text) => {
//           doc.text(text, 10, yPosition);
//           yPosition += 7;
//         });

//         yPosition += 5;

//         doc.setFont('helvetica', 'bold');
//         doc.text('Descripción:', 10, yPosition);

//         yPosition += 5;

//         doc.setFont('helvetica', 'normal');

//         const descripcionLines = doc.splitTextToSize(
//           intento.ejercicio_descripcion || 'N/A',
//           pageWidth - 20
//         );

//         doc.text(descripcionLines, 10, yPosition);

//         yPosition += descripcionLines.length * 5 + 10;

//         const estadisticas = this.calcularEstadisticasPacientes(intentoId);

//         console.log('Estadísticas para PDF:', estadisticas);

//         // Aquí ya puedes activar tus tablas
//          yPosition = this.agregarTablaTriage(doc, yPosition, estadisticas);
        
//         yPosition = this.agregarTablaSobretraje(doc, yPosition, estadisticas);
//         //yPosition = this.agregarTablaInfratraje(doc, yPosition, estadisticas);
//         // this.agregarTablaMortalidad(doc, yPosition, estadisticas);

//         const nombreArchivo = `Intento_${intento.id}_${intento.ejercicio_nombre.replace(/\s+/g, '_')}.pdf`;

//         doc.save(nombreArchivo);

//         console.log('PDF descargado:', nombreArchivo);

//       } catch (error) {
//         console.error('Error al generar PDF:', error);
//       }
//     },
//     error: (error: any) => {
//       console.error('Error al cargar datos para el PDF:', error);
//     }
//   });
// }
 
  

//   // /**
//   //  * Agrega tabla TRIAGE 1ª al PDF
//   //  */
//    private agregarTablaTriage(doc: any, yPosition: number, estadisticas: any): number {
//     doc.setFontSize(12);
//     doc.setFont('helvetica', 'bold');
//     doc.text('TRIAGE 1ª', 10, yPosition);
//     yPosition += 8;

//     const tableData = [
//       ['Color', 'Nº en Ejercicio', 'Nº Triados', '% Triados'],
//       [
//         'NEGRO',
//         estadisticas.negro.total.toString(),
//         estadisticas.negro.triado.toString(),
//         estadisticas.negro.total > 0 ? ((estadisticas.negro.triado / estadisticas.negro.total) * 100).toFixed(2) + '%' : '0%'
//       ],
//       [
//         'ROJO',
//         estadisticas.rojo.total.toString(),
//         estadisticas.rojo.triado.toString(),
//         estadisticas.rojo.total > 0 ? ((estadisticas.rojo.triado / estadisticas.rojo.total) * 100).toFixed(2) + '%' : '0%'
//       ],
//       [
//         'AMARILLO',
//         estadisticas.amarillo.total.toString(),
//         estadisticas.amarillo.triado.toString(),
//         estadisticas.amarillo.total > 0 ? ((estadisticas.amarillo.triado / estadisticas.amarillo.total) * 100).toFixed(2) + '%' : '0%'
//       ],
//       [
//         'VERDE',
//         estadisticas.verde.total.toString(),
//         estadisticas.verde.triado.toString(),
//         estadisticas.verde.total > 0 ? ((estadisticas.verde.triado / estadisticas.verde.total) * 100).toFixed(2) + '%' : '0%'
//       ]
//     ];

//     autoTable(doc, {
//       head: [tableData[0]],
//       body: tableData.slice(1),
//       startY: yPosition,
//       margin: { left: 10, right: 10 },
//       headStyles: {
//         fillColor: [0, 0, 0],
//         textColor: [255, 255, 255],
//         fontStyle: 'bold'
//       },
//       bodyStyles: {
//         textColor: [0, 0, 0]
//       }
//     });

//     return (doc as any).lastAutoTable.finalY + 10;
//   }

  
//   /**
//    * Agrega tabla SOBRETRAJE al PDF
//    */
// private agregarTablaSobretraje(doc: any, yPosition: number, estadisticas: any): number {
//   if (yPosition > 250) {
//     doc.addPage();
//     yPosition = 10;
//   }

//   doc.setFontSize(12);
//   doc.setFont('helvetica', 'bold');
//   doc.text('SOBRETRIAJE', 10, yPosition);
//   yPosition += 8;

//   const verdesSobretriados = estadisticas.sobretriaje.verdesTriadosAmarilloORojo;
//   const amarillosSobretriados = estadisticas.sobretriaje.amarillosTriadosRojo;
//   const totalSobretriados = estadisticas.sobretriaje.totalSobretriados;

//   const totalVerdes = estadisticas.verde.total;
//   const totalAmarillos = estadisticas.amarillo.total;
//   const totalVerdesAmarillos = estadisticas.sobretriaje.totalVerdesAmarillos;

//   const porcentajeVerdes =
//     totalVerdes > 0
//       ? ((verdesSobretriados / totalVerdes) * 100).toFixed(2) + '%'
//       : '0%';

//   const porcentajeAmarillos =
//     totalAmarillos > 0
//       ? ((amarillosSobretriados / totalAmarillos) * 100).toFixed(2) + '%'
//       : '0%';

//   const porcentajeTotal =
//     totalVerdesAmarillos > 0
//       ? ((totalSobretriados / totalVerdesAmarillos) * 100).toFixed(2) + '%'
//       : '0%';

//   const tableData = [
//     ['Concepto', 'Número', '%'],
//     [
//       'Verdes triados como amarillo o rojo',
//       verdesSobretriados.toString(),
//       porcentajeVerdes
//     ],
//     [
//       'Amarillos triados como rojo',
//       amarillosSobretriados.toString(),
//       porcentajeAmarillos
//     ],
//     [
//       'Total sobretriaje',
//       totalSobretriados.toString(),
//       porcentajeTotal
//     ]
//   ];

//   autoTable(doc, {
//     head: [tableData[0]],
//     body: tableData.slice(1),
//     startY: yPosition,
//     margin: { left: 10, right: 10 },
//     headStyles: {
//       fillColor: [255, 255, 0],
//       textColor: [0, 0, 0],
//       fontStyle: 'bold'
//     },
//     bodyStyles: {
//       textColor: [0, 0, 0]
//     }
//   });

//   return (doc as any).lastAutoTable.finalY + 10;
// }

//   /**
//    * Agrega tabla INFRATRAJE al PDF
//    */
//   // private agregarTablaInfratraje(doc: any, yPosition: number, estadisticas: any): number {
//   //   // Verificar si hay espacio en la página
//   //   if (yPosition > 250) {
//   //     doc.addPage();
//   //     yPosition = 10;
//   //   }

//   //   doc.setFontSize(12);
//   //   doc.setFont('helvetica', 'bold');
//   //   doc.text('INFRATRAJE (Amarillos no triados como verdes)', 10, yPosition);
//   //   yPosition += 8;

//   //   // Calcular infratraje: amarillos que no fueron triados
//   //   const infratraje = estadisticas.amarillo.noTriado;
//   //   const porcentajeInfratraje = estadisticas.amarillo.total > 0 ? ((infratraje / estadisticas.amarillo.total) * 100).toFixed(2) : '0';

//   //   const tableData = [
//   //     ['Concepto', 'Número', '%'],
//   //     ['Nº de Amarillos No Triados', infratraje.toString(), porcentajeInfratraje + '%'],
//   //     [
//   //       'Total Infratraje',
//   //       infratraje.toString(),
//   //       '((Amarillos no triados) / (Total amarillos)) x 100'
//   //     ]
//   //   ];

//   //   autoTable(doc, {
//   //     head: [tableData[0]],
//   //     body: tableData.slice(1),
//   //     startY: yPosition,
//   //     margin: { left: 10, right: 10 },
//   //     headStyles: {
//   //       fillColor: [255, 165, 0],
//   //       textColor: [0, 0, 0],
//   //       fontStyle: 'bold'
//   //     },
//   //     bodyStyles: {
//   //       textColor: [0, 0, 0]
//   //     }
//   //   });

//   //   return (doc as any).lastAutoTable.finalY + 10;
//   // }

//   /**
//    * Agrega tabla MORTALIDAD EVITABLE al PDF
//    */
//   // private agregarTablaMortalidad(doc: any, yPosition: number, estadisticas: any): void {
//   //   // Verificar si hay espacio en la página
//   //   if (yPosition > 250) {
//   //     doc.addPage();
//   //     yPosition = 10;
//   //   }

//   //   doc.setFontSize(12);
//   //   doc.setFont('helvetica', 'bold');
//   //   doc.text('MORTALIDAD EVITABLE', 10, yPosition);
//   //   yPosition += 8;

//   //   const tableData = [
//   //     ['Concepto', 'Descripción'],
//   //     ['Negros Evitables', 'Pacientes que pasaron de verde/amarillo/rojo a negro durante el ejercicio'],
//   //     ['Estado Final', 'Los pacientes que terminaron en color negro después del triaje']
//   //   ];

//   //   autoTable(doc, {
//   //     head: [tableData[0]],
//   //     body: tableData.slice(1),
//   //     startY: yPosition,
//   //     margin: { left: 10, right: 10 },
//   //     headStyles: {
//   //       fillColor: [0, 0, 0],
//   //       textColor: [255, 255, 255],
//   //       fontStyle: 'bold'
//   //     },
//   //     bodyStyles: {
//   //       textColor: [0, 0, 0]
//   //     }
//   //   });
//   // }

// private calcularEstadisticasPacientes(intentoId: string): any {
//   const acciones = this.detallesResultado[intentoId] || [];
//   const pacientes = this.pacientesPorIntento[intentoId] || [];

//   const coloresValidos = ['negro', 'rojo', 'amarillo', 'verde'];

//   const contadores: { [key: string]: any } = {
//     negro: { triado: 0, total: 0 },
//     rojo: { triado: 0, total: 0 },
//     amarillo: { triado: 0, total: 0 },
//     verde: { triado: 0, total: 0 },
//     sobretriaje: {
//       verdesTriadosAmarilloORojo: 0,
//       amarillosTriadosRojo: 0,
//       totalSobretriados: 0,
//       totalVerdesAmarillos: 0
//     }
//   };

//   const pacientesPorId = new Map<string, any>();
//   const colorAsignadoPorPaciente = new Map<string, string>();

//   pacientes.forEach((paciente: any) => {
//     const pacienteId = String(
//       paciente.id ??
//       paciente.paciente_id ??
//       paciente.pacienteId ??
//       paciente.id_paciente ??
//       ''
//     );

//     let colorOriginal = String(paciente.color ?? '').trim().toLowerCase();

//     if (!coloresValidos.includes(colorOriginal)) {
//       colorOriginal = 'verde';
//     }

//     contadores[colorOriginal].total++;

//     if (pacienteId) {
//       pacientesPorId.set(pacienteId, {
//         ...paciente,
//         colorOriginal
//       });
//     }
//   });

//   acciones.forEach((accion: any) => {
//     const accionPacienteId =
//       accion.paciente_id ??
//       accion.pacienteId ??
//       accion.id_paciente ??
//       accion.paciente?.id ??
//       (
//         typeof accion.paciente === 'string' || typeof accion.paciente === 'number'
//           ? accion.paciente
//           : ''
//       );

//     const pacienteId = String(accionPacienteId ?? '');

//     let colorAsignado = String(accion.color_asignado ?? '').trim().toLowerCase();

//     if (!coloresValidos.includes(colorAsignado)) {
//       colorAsignado = 'verde';
//     }

//     if (pacienteId) {
//       colorAsignadoPorPaciente.set(pacienteId, colorAsignado);
//     }
//   });

//   colorAsignadoPorPaciente.forEach((colorAsignado: string, pacienteId: string) => {
//     contadores[colorAsignado].triado++;

//     const paciente = pacientesPorId.get(pacienteId);

//     if (!paciente) {
//       return;
//     }

//     const colorOriginal = paciente.colorOriginal;

//     if (
//       colorOriginal === 'verde' &&
//       (colorAsignado === 'amarillo' || colorAsignado === 'rojo')
//     ) {
//       contadores.sobretriaje.verdesTriadosAmarilloORojo++;
//     }

//     if (
//       colorOriginal === 'amarillo' &&
//       colorAsignado === 'rojo'
//     ) {
//       contadores.sobretriaje.amarillosTriadosRojo++;
//     }
//   });

//   contadores.sobretriaje.totalSobretriados =
//     contadores.sobretriaje.verdesTriadosAmarilloORojo +
//     contadores.sobretriaje.amarillosTriadosRojo;

//   contadores.sobretriaje.totalVerdesAmarillos =
//     contadores.verde.total +
//     contadores.amarillo.total;

//   console.log('Estadísticas calculadas:', contadores);

//   return contadores;
// }
//    obtenerPacientesIntento(intentoId: string): Observable<any[]> {
//   return this.ejerciciosService.getPacientesByIntento(intentoId).pipe(
//     map((data: any) => {
//       console.log('Respuesta completa pacientes:', data);

//       if (Array.isArray(data)) {
//         return data;
//       }

//       return data?.pacientes || [];
//     }),
//     tap((pacientes: any[]) => {
//       this.pacientesPorIntento[intentoId] = pacientes;
//       console.log('Pacientes del intento:', pacientes);
//     })
//   );
// }
//   obtenerDetallesIntento(intentoId: string) {
//   return this.ejerciciosService.obtenerDetallesResultado(intentoId).pipe(
//     map((data: any) => {
//       if (Array.isArray(data)) {
//         return data;
//       }

//       return data?.detalles || data?.acciones || [];
//     }),
//     tap((detalles: any[]) => {
//       this.detallesResultado[intentoId] = detalles;
//       console.log('Detalles del intento:', detalles);
//     })
//   );
// }
// }
