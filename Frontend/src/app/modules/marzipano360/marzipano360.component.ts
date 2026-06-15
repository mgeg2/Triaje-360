import { Component, ElementRef, OnInit, OnDestroy, ViewChild, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EjerciciosService } from 'app/core/ejercicios/ejercicios.service';
import { PacientesService } from 'app/core/pacientes/pacientes.service';
import { AudioService } from 'app/core/audio-manager/audio.service';
import * as Marzipano from 'marzipano';
import Swal from 'sweetalert2';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-marzipano360',
  imports: [CommonModule],
  templateUrl: './marzipano360.component.html',
  styles: []
})
export class Marzipano360Component implements OnInit, OnDestroy {
  // Offset global para ajustar la orientación del panorama (en radianes)
  offsetYaw: number = 0;  // Cambiar a Math.PI si los pacientes están invertidos horizontalmente

  // Mapa de posiciones exactas para la rejilla de 4x16
  posiciones: any[][] = [
    [{ "yaw": -3.84, "pitch": -0.65 }, { "yaw": -3.49, "pitch": -1.1 }, { "yaw": 3.29, "pitch": -1.25 }, { "yaw": 3.73, "pitch": -1.35 }, 
      { "yaw": 4.04, "pitch": -0.65 }, { "yaw": 4.39, "pitch": -1.12 }, { "yaw": 4.84, "pitch": -1.3 }, { "yaw": 5.29, "pitch": -1.3 }, 
      { "yaw": -0.70, "pitch": -0.57 }, { "yaw": -0.35, "pitch": -1.03 }, { "yaw": 0.15, "pitch": -1.21 }, { "yaw": 0.6, "pitch": -1.3 }, 
      { "yaw": 0.9, "pitch": -0.65 }, { "yaw": 1.25, "pitch": -1.08 }, { "yaw": 1.7, "pitch": -1.25 }, { "yaw": 2.15, "pitch": -1.25 }],


    [{ "yaw": -3.84, "pitch": -0.55 }, { "yaw": -3.49, "pitch": -1.05 }, { "yaw": 3.29, "pitch": -1.23 }, { "yaw": 3.73, "pitch": -1.35 },
       { "yaw": 4.04, "pitch": -0.45 }, { "yaw": 4.39, "pitch": -1.05 }, { "yaw": 4.84, "pitch": -1.25 }, { "yaw": 5.29, "pitch": -1.3 },
        { "yaw": -0.70, "pitch": -0.45 }, { "yaw": -0.35, "pitch": -0.95 }, { "yaw": 0.15, "pitch": -1.18}, { "yaw": 0.6, "pitch": -1.28 }, 
        { "yaw": 0.9, "pitch": -0.55 }, { "yaw": 1.25, "pitch": -1 }, { "yaw": 1.7, "pitch": -1.25 }, { "yaw": 2.15, "pitch": -1.25 }],

    [{ "yaw": -3.84, "pitch": -0.45 }, { "yaw": -3.49, "pitch": -1 }, { "yaw": 3.29, "pitch": -1.2 }, { "yaw": 3.73, "pitch": -1.33 },
       { "yaw": 4.04, "pitch": -0.25 }, { "yaw": 4.39, "pitch": -1 }, { "yaw": 4.84, "pitch": -1.2 }, { "yaw": 5.29, "pitch": -1.25 }, 
       { "yaw": -0.70, "pitch": -0.25 }, { "yaw": -0.35, "pitch": -0.85 }, { "yaw": 0.15, "pitch": -1.12 }, { "yaw": 0.6, "pitch": -1.27 },
        { "yaw": 0.9, "pitch": -0.27 }, { "yaw": 1.25, "pitch": -1 }, { "yaw": 1.7, "pitch": -1.25 }, { "yaw": 2.15, "pitch": -1.25 }],

    [{ "yaw": -3.84, "pitch": -0.25 }, { "yaw": -3.49, "pitch": -1 }, { "yaw": 3.29, "pitch": -1.15 }, { "yaw": 3.73, "pitch": -1.3 }, 
      { "yaw": 4.04, "pitch": -0.15 }, { "yaw": 4.39, "pitch": -0.9 }, { "yaw": 4.84, "pitch": -1.15 }, { "yaw": 5.29, "pitch": -1.25 }, 
      { "yaw": -0.70, "pitch": -0.05 }, { "yaw": -0.35, "pitch": -0.75 }, { "yaw": 0.15, "pitch": -1.08 }, { "yaw": 0.6, "pitch": -1.25 }, 
      { "yaw": 0.9, "pitch": -0.25 }, { "yaw": 1.25, "pitch": -0.9}, { "yaw": 1.7, "pitch": -1.25 }, { "yaw": 2.15, "pitch": -1.25 }]
  ];

  @ViewChild('pano', { static: true }) panoElement: ElementRef | undefined;
  ejercicioId: string = '';
  currentImageIndex: number = 0;
  currentScene: any = null;
  currentViewer: any = null;

  pacientesUbicados: any[] = [];
  todosPacientes: any[] = [];
  imagenesEjercicio: any[] = [];
  pacienteSeleccionado: any = null;
  acciones: any[] = [];
  accionesSeleccionadas: any[] = [];
  colorSeleccionado: string = '';
  tiempoRestante: number = 0; // 160 segundos (3 minutos)
  intervalId: any;
  intervalVerificacionColores: any;

  // Mapeo de pacientes a sus elementos de imagen en el marzipano
  pacienteImagenesMap: Map<string, HTMLImageElement> = new Map();

  // Orden de colores de mejor a peor
  coloresOrdenados: string[] = ['verde', 'amarillo', 'rojo', 'negro'];

  // Mapeo de acciones con sus tiempos en segundos
  tiemposAcciones: { [key: string]: number } = {
    'pls': 30,
    'guedel': 10,
    'collarin cervical': 60,
    'compresion sangrado': 60,
    'Drenaje torácico': 60
  };

  // Mapeo de colores a clases de borde
  colorBordeMap: { [key: string]: string } = {
    'negro': 'border-black',
    'rojo': 'border-red-600',
    'amarillo': 'border-yellow-400',
    'verde': 'border-green-600'
  };

  // Propiedades para manejo de sonidos
  sonidosEjercicio: any[] = [];
  audioElementos: HTMLAudioElement[] = [];
  sonidosReproduciendo: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ejerciciosService: EjerciciosService,
    private pacientesService: PacientesService,
    private audioService: AudioService,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.ejercicioId = params['id'];
      console.log('Ejercicio ID:', this.ejercicioId);

      // Obtener acciones disponibles
      this.obtenerAcciones();

      // Obtener imágenes del ejercicio en orden
      this.obtenerImagenesEjercicio();

      // Obtener sonidos del ejercicio
      this.obtenerSonidosEjercicio();

      // Iniciar el temporizador
      this.iniciarTemporizador();

      // Iniciar verificación de empeoramiento de pacientes
      this.iniciarVerificacionColoresPacientes();
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    if (this.intervalVerificacionColores) {
      clearInterval(this.intervalVerificacionColores);
    }
    // Detener reproducción de sonidos
    this.detenerSonidos();
  }

  /**
   * Obtiene las acciones disponibles de la base de datos
   */
  obtenerAcciones(): void {
    this.pacientesService.getAccionesPaciente().subscribe({
      next: (acciones) => {
        this.acciones = acciones;
        console.log('=== ACCIONES OBTENIDAS ===');
        console.log('Total acciones:', this.acciones.length);
        console.log('Acciones:', this.acciones);
        this.acciones.forEach((a: any, idx: number) => {
          console.log(`  ${idx + 1}. ${a.nombre_accion || a.name} (ID: ${a.id})`);
        });
      },
      error: (error) => {
        console.error('Error al obtener acciones:', error);
      }
    });
  }

  /**
   * Obtiene los pacientes del ejercicio y los almacena sin el campo color
   */
  obtenerPacientesEjercicio(): void {
    this.ejerciciosService.getPacientesEjercicio(this.ejercicioId).subscribe({
      next: (pacientes) => {
        console.log('Pacientes obtenidos del ejercicio:', pacientes);
        // Remover el campo 'color' de cada paciente
        this.pacientesUbicados = pacientes.map((paciente: any) => {
          const { color, ...pacienteSinColor } = paciente;
          return pacienteSinColor;
        });
        console.log('=== PACIENTES UBICADOS CARGADOS ===');
        console.log('Total pacientes:', this.pacientesUbicados.length);
        console.log('Pacientes ubicados:', this.pacientesUbicados);
        this.pacientesUbicados.forEach((p: any, idx: number) => {
          console.log(`Paciente ${idx}: ${p.nombre}`);
          console.log(`  - posicion:`, p.posicion);
          console.log(`  - fila directa:`, p.fila);
          console.log(`  - columna directa:`, p.columna);
        });
      },
      error: (error) => {
        console.error('Error al obtener pacientes del ejercicio:', error);
      }
    });
  }

  /**
   * Obtiene las imágenes del ejercicio ordenadas
   */
  obtenerImagenesEjercicio(): void {
    this.ejerciciosService.getImagenesFromEjercicio(this.ejercicioId).subscribe({
      next: (imagenes) => {
        // Las imágenes ya vienen ordenadas por 'orden' desde el backend
        this.imagenesEjercicio = imagenes;
        console.log('Imágenes del ejercicio en orden:', this.imagenesEjercicio);
        
        // Obtener todos los pacientes del ejercicio
        this.ejerciciosService.getPacientesEjercicio(this.ejercicioId).subscribe({
          next: (pacientes) => {
            console.log('Todos los pacientes del ejercicio:', pacientes);
            // Almacenar todos los pacientes con su color inicial
            this.todosPacientes = pacientes.map((paciente: any) => {
              return {
                ...paciente,
                colorInicial: paciente.color || 'verde'  // Guardar color inicial para el empeoramiento
              };
            });
            
            // Filtrar pacientes de la primera imagen
            this.cambiarImagen(0);
            
            // Iniciar Marzipano con la primera imagen
            this.iniciarMarzipano(this.imagenesEjercicio);
          },
          error: (error) => {
            console.error('Error al obtener pacientes del ejercicio:', error);
          }
        });
      },
      error: (error) => {
        console.error('Error al obtener imágenes del ejercicio:', error);
      }
    });
  }

  /**
   * Obtiene los sonidos del ejercicio y los reproduce
   */
  obtenerSonidosEjercicio(): void {
    this.audioService.getSonidosFromEjercicio(this.ejercicioId).subscribe({
      next: (sonidos) => {
        console.log('Sonidos obtenidos del ejercicio:', sonidos);
        this.sonidosEjercicio = sonidos;
        // Reproducir los sonidos cuando se obtienen
        this.reproducirSonidos();
      },
      error: (error) => {
        console.error('Error al obtener sonidos del ejercicio:', error);
      }
    });
  }

  /**
   * Reproduce los sonidos del ejercicio en paralelo (todos a la vez)
   */
  reproducirSonidos(): void {
    if (!this.sonidosEjercicio || this.sonidosEjercicio.length === 0) {
      console.log('No hay sonidos para reproducir');
      return;
    }

    console.log('Iniciando reproducción de sonidos en paralelo...');
    this.sonidosReproduciendo = true;

    // Si ya existen elementos de audio, simplemente reanudar la reproducción
    if (this.audioElementos.length > 0) {
      this.audioElementos.forEach(audio => {
        audio.play().catch(err => {
          console.warn('Error al reproducir audio:', err);
        });
      });
      this.sonidosReproduciendo = true;
      console.log('Reanudando reproducción de todos los sonidos...');
      return;
    }

    // Limpiar elementos de audio previos
    this.audioElementos.forEach(audio => audio.pause());
    this.audioElementos = [];

    // Crear elementos de audio para cada sonido
    this.sonidosEjercicio.forEach((sonido: any, index: number) => {
      const audioElement = new Audio();
      
      // Construir la ruta del sonido
      // Si el nombre ya tiene extensión, usarlo así
      // Si no tiene, intentar con extensiones comunes
      let rutaSonido = `assets/sonidos/${sonido.nombre_archivo}`;
      
      // Verificar si ya tiene extensión de audio
      const extensionesComunes = ['.mp3', '.wav', '.ogg', '.flac'];
      const tieneExtension = extensionesComunes.some(ext => 
        sonido.nombre_archivo.toLowerCase().endsWith(ext)
      );
      
      // Si no tiene extensión, intentar con .mp3 por defecto
      if (!tieneExtension) {
        rutaSonido = `assets/sonidos/${sonido.nombre_archivo}`;
      }
      
      audioElement.src = rutaSonido;
      audioElement.volume = 0.5; // Volumen al 50%
      audioElement.preload = 'auto';
      audioElement.loop = true; // Loop infinito para cada sonido

      // Manejar errores de carga
      audioElement.addEventListener('error', () => {
        console.error(`Error al cargar sonido: ${rutaSonido}`);
        // Si falla con .mp3, intentar con .wav
        if (rutaSonido.endsWith('.mp3')) {
          const rutaAlternativa = `assets/sonidos/${sonido.nombre_archivo}.wav`;
          console.log(`Intentando ruta alternativa: ${rutaAlternativa}`);
          audioElement.src = rutaAlternativa;
          audioElement.addEventListener('error', () => {
            console.error(`Error también con ruta alternativa: ${rutaAlternativa}`);
          }, { once: true });
        }
      });

      this.audioElementos.push(audioElement);
    });

    // Reproducir todos los sonidos a la vez
    this.audioElementos.forEach((audio, index) => {
      audio.play().catch(err => {
        console.warn(`No se pudo reproducir sonido ${index + 1}:`, err);
      });
      console.log(`Reproduciendo sonido ${index + 1}...`);
    });
  }

  /**
   * Detiene la reproducción de todos los sonidos
   */
  detenerSonidos(): void {
    console.log('Deteniendo sonidos...');
    this.audioElementos.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.sonidosReproduciendo = false;
  }

  /**
   * Pausa la reproducción de sonidos
   */
  pausarSonidos(): void {
    console.log('Pausando sonidos...');
    this.audioElementos.forEach(audio => {
      audio.pause();
    });
    this.sonidosReproduciendo = false;
  }

  iniciarMarzipano(imagenesEjercicio): void {
    console.log('Iniciando Marzipano con imágenes:', this.imagenesEjercicio);
    if (this.panoElement) {
      // Limpiar viewer anterior si existe
      if (this.currentViewer) {
        try {
          this.currentViewer.destroy();
        } catch (e) {
          console.warn('Error al destruir viewer anterior:', e);
        }
      }

      // Limpiar elemento pano
      const panoDiv = this.panoElement.nativeElement;
      panoDiv.innerHTML = '';

      console.log('Inicializando Marzipano en el elemento:', panoDiv);
      const viewer = new Marzipano.Viewer(panoDiv);
      this.currentViewer = viewer;
      
      // Obtener la imagen actual según el índice
      const imagenActual = imagenesEjercicio[this.currentImageIndex];
      
      // Configurar con 6 imágenes de cubo (0.png, 1.png, 2.png, 3.png, 4.png, 5.png)
      const nombreSinExtension = imagenActual.nombre_archivo.split('.')[0];
      const source = Marzipano.ImageUrlSource.fromString(
        `assets/escenarios/Tiles/${nombreSinExtension}/{f}.png`
      );

      const geometry = new Marzipano.CubeGeometry(
        [
          {
            "tileSize": 2048,
            "size": 2048
          }
        ]
      );
      const view = new Marzipano.RectilinearView();

      // Establecer el zoom inicial
      view.setParameters({ fov: Math.PI / 1.5 }); // Ajusta el FOV para el zoom deseado

      // Definir límites de zoom
      const minFov = 1.0;  // Máximo zoom permitido (menor FOV = más zoom)
      const maxFov = Math.PI / 1.5;  // FOV inicial (no permitir zoom out)

      // Crear limitador personalizado que controle tanto pitch como fov
      const customLimiter = function (params) {
        // Limitar FOV (zoom)
        if (params.fov !== undefined) {
          params.fov = Math.max(minFov, Math.min(maxFov, params.fov));
        }
        // Limitar pitch (movimiento vertical)
        if (params.pitch !== undefined) {
          params.pitch = Math.max(-0.3, Math.min(0.3, params.pitch));
        }
        return params;
      };

      view.setLimiter(customLimiter);
      const scene = viewer.createScene({
        source: source,
        geometry: geometry,
        view: view
      });
      scene.switchTo();
      this.currentScene = scene;

      // Crear hotspots después de que la escena esté lista
      setTimeout(() => {
        this.crearHotspotsDespacientes(scene);
      }, 500);
    }
    else {
      console.error('El elemento pano no está disponible.');
    }
  }

  /**
   * Crea hotspots que se mueven con el panorama
   */
  crearHotspotsDespacientes(scene: any): void {
    if (!this.pacientesUbicados || this.pacientesUbicados.length === 0) {
      console.log('No hay pacientes para mostrar como hotspots');
      return;
    }

    const hotspotContainer = scene.hotspotContainer();

    this.pacientesUbicados.forEach((paciente: any, index: number) => {
      // Debug: Log de paciente completo
      console.log(`DEBUG Paciente ${index}:`, paciente);
      console.log(`  fila directa: ${paciente.fila}, columna directa: ${paciente.columna}`);
      console.log(`  posicion object: ${JSON.stringify(paciente.posicion)}`);
      
      // Obtener fila y columna - priorizar posicion.fila/columna si existen
      let fila = paciente.posicion?.fila;
      let columna = paciente.posicion?.columna;
      
      // Si no existen en posicion, intentar usar los directos
      if (fila === undefined || fila === null) {
        fila = paciente.fila;
      }
      if (columna === undefined || columna === null) {
        columna = paciente.columna;
      }
      
      // Convertir a números por si acaso vienen como strings
      let filaNum = Number(fila);
      let columnaNum = Number(columna);
      
      console.log(`  Valores antes de ajuste: filaNum=${filaNum}, columnaNum=${columnaNum}`);
      
      // Validar que no sean NaN
      if (isNaN(filaNum) || isNaN(columnaNum)) {
        console.error(`ERROR: Valores inválidos (NaN) para ${paciente.nombre}`);
        return;
      }
      
      // IMPORTANTE: La BD devuelve valores 1-based (1-4 y 1-16), pero el array está 0-indexed
      // Convertir a 0-based para indexar correctamente
      filaNum = filaNum - 1;
      columnaNum = columnaNum - 1;
      
      console.log(`  Valores después de ajuste (0-based): filaNum=${filaNum}, columnaNum=${columnaNum}`);
      
      // Validar que fila y columna estén dentro del rango
      if (filaNum < 0 || filaNum > 3 || columnaNum < 0 || columnaNum > 15) {
        console.error(`ERROR: Posición fuera de rango para ${paciente.nombre}: fila=${filaNum}, columna=${columnaNum}`);
        return; // Saltar este paciente
      }
      
      // Obtener la posición exacta del mapa
      const posicion = this.posiciones[filaNum][columnaNum];
      if (!posicion) {
        console.error(`ERROR: No hay posición en posiciones[${filaNum}][${columnaNum}]`);
        return;
      }
      // Aplicar offset global para sincronizar con la rotación
      const yaw = posicion.yaw ;
      const pitch = posicion.pitch;
      
      console.log(`  ✓ Posición asignada: [${filaNum}][${columnaNum}], yaw=${yaw.toFixed(2)}, pitch=${pitch.toFixed(2)}, offsetYaw=${this.offsetYaw.toFixed(2)}`);

      // Crear elemento de imagen del paciente (sin fondo)
      const hotspotElement = document.createElement('div');
      hotspotElement.className = 'flex items-center justify-center pointer-events-auto w-15 h-15 relative z-10';
      
      const imgElement = document.createElement('img');
      const ruta = 'assets/pacientes/';
      const imagenSrc = paciente.nombre_archivo ? `${ruta}${paciente.nombre_archivo}` : 'assets/avatars/default.png';
      imgElement.src = imagenSrc;
      imgElement.alt = paciente.nombre;
      console.log(`Cargando imagen para ${paciente.nombre}: ${imagenSrc}`);
      
      // No mostrar borde de color inicialmente (será asignado al guardarse en el modal)
      imgElement.className = `w-15 h-15 rounded-full object-contain cursor-pointer border-4 border-transparent transition-all duration-300 shadow-md flex-shrink-0 block`;
      
      // Guardar referencia al elemento de imagen para actualizar color después
      paciente.imgElement = imgElement;
      this.pacienteImagenesMap.set(paciente.id, imgElement);
      
      // Manejar errores de carga de imagen
      imgElement.addEventListener('error', () => {
        console.warn(`Error cargando imagen: ${imagenSrc}`);
        imgElement.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60"%3E%3Crect fill="%23ddd" width="60" height="60"/%3E%3Ctext x="30" y="30" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3E?%3C/text%3E%3C/svg%3E';
        imgElement.classList.add('bg-gray-200');
      });

      // Añadir efecto hover
      imgElement.addEventListener('mouseenter', () => {
        imgElement.classList.add('scale-125', 'shadow-lg');
        imgElement.classList.remove('shadow-md');
      });
      imgElement.addEventListener('mouseleave', () => {
        imgElement.classList.remove('scale-125', 'shadow-lg');
        imgElement.classList.add('shadow-md');
      });

      // Click para mostrar descripción
      imgElement.addEventListener('click', () => {
        this.mostrarDescripcion(paciente);
      });

      hotspotElement.appendChild(imgElement);

      // Crear hotspot en Marzipano que se mueva con el panorama
      hotspotContainer.createHotspot(hotspotElement, {
        yaw: yaw,
        pitch: pitch
      });

      console.log(`Hotspot creado para paciente: ${paciente.nombre} (fila: ${paciente.fila}, columna: ${paciente.columna})`);
    });
  }

  /**
   * Muestra la descripción del paciente en un modal
   */
  mostrarDescripcion(paciente: any): void {
    this.pacienteSeleccionado = paciente;
    
    // NO cargar acciones previas - el alumno no debe saber qué se hizo antes
    this.accionesSeleccionadas = [];
    this.colorSeleccionado = ''; // No mostrar color inicial (no queremos que se vea cuál es)
    console.log('Modal abierto para:', paciente.nombre);
    console.log('Acciones disponibles:', this.acciones);
    console.log('Acciones previas del paciente (ocultas):', paciente.acciones);
  }

  /**
   * Cierra el modal de descripción
   */
  cerrarModal(): void {
    this.pacienteSeleccionado = null;
    this.accionesSeleccionadas = [];
    this.colorSeleccionado = '';
  }

  /**
   * Alterna la selección de una acción
   */
  alternarAccion(accion: any): void {
    const index = this.accionesSeleccionadas.findIndex(a => a.id === accion.id);
    const nombreAccion = (accion.nombre_accion || accion.nombre || accion.name || '').toLowerCase().trim();
    // Usar el tiempo del objeto o buscar en el mapeo
    const tiempoARestar = accion.tiempo || this.tiemposAcciones[nombreAccion] || 0;

    console.log('=== DEBUG alternarAccion ===');
    console.log('Acción objeto:', accion);
    console.log('Nombre acción (lowercase):', nombreAccion);
    console.log('Tiempo a restar:', tiempoARestar);
    console.log('Mapeo de tiempos:', this.tiemposAcciones);
    console.log('============================');

    if (index > -1) {
      // Deseleccionar: restar el tiempo (liberar el tiempo de la acción)
      this.accionesSeleccionadas.splice(index, 1);
      this.tiempoRestante -= tiempoARestar;
      console.log(`Acción deseleccionada: ${nombreAccion}, tiempo liberado: ${tiempoARestar}s, tiempo total: ${this.tiempoRestante}s`);
    } else {
      // Seleccionar: sumar el tiempo (registrar que gastas tiempo en esa acción)
      this.accionesSeleccionadas.push(accion);
      this.tiempoRestante += tiempoARestar;
      console.log(`Acción seleccionada: ${nombreAccion}, tiempo sumado: ${tiempoARestar}s, tiempo total: ${this.tiempoRestante}s`);
    }
  }



  /**
   * Selecciona un color para el paciente (solo en el modal, sin actualizar en panorama aún)
   */
  seleccionarColor(color: string): void {
    this.colorSeleccionado = color;
    
    // Solo actualizar en el objeto paciente, el borde se aplicará al guardar
    if (this.pacienteSeleccionado) {
      this.pacienteSeleccionado.color = color;
    }
    console.log(`Color seleccionado en modal para ${this.pacienteSeleccionado?.nombre}: ${color}`);
  }

  /**
   * Verifica si una acción está seleccionada
   */
  esAccionSeleccionada(accion: any): boolean {
    return this.accionesSeleccionadas.some(a => a.id === accion.id);
  }

  /**
   * Guarda las acciones seleccionadas para el paciente
   */
 guardarAcciones(): void {
  if (this.pacienteSeleccionado) {
    const tieneAcciones =
      Array.isArray(this.accionesSeleccionadas) &&
      this.accionesSeleccionadas.length > 0;

    const tieneColor = !!this.colorSeleccionado;

    this.pacienteSeleccionado.acciones = this.accionesSeleccionadas;

    if (tieneColor) {
      this.pacienteSeleccionado.color = this.colorSeleccionado;
    }

    const huboIntervencionManual = tieneAcciones || tieneColor;

    if (huboIntervencionManual) {
      this.pacienteSeleccionado.interveniuoManualmente = true;
    }

    const pacienteEnLista = this.pacientesUbicados.find(
      p => p.id === this.pacienteSeleccionado.id
    );

    if (pacienteEnLista) {
      pacienteEnLista.acciones = this.accionesSeleccionadas;

      if (tieneColor) {
        pacienteEnLista.color = this.colorSeleccionado;
      }

      if (huboIntervencionManual) {
        pacienteEnLista.interveniuoManualmente = true;
      }
    }

    const pacienteEnTodos = this.todosPacientes.find(
      p => p.id === this.pacienteSeleccionado.id
    );

    if (pacienteEnTodos) {
      pacienteEnTodos.acciones = this.accionesSeleccionadas;

      if (tieneColor) {
        pacienteEnTodos.color = this.colorSeleccionado;
      }

      if (huboIntervencionManual) {
        pacienteEnTodos.interveniuoManualmente = true;
      }
    }

    if (tieneColor) {
      this.actualizarColorPacienteEnUI(this.pacienteSeleccionado);
    }

    this.cerrarModal();
  }
}
  /**
   * Inicia el temporizador (cuenta hacia delante sin límite)
   */
  iniciarTemporizador(): void {
    this.intervalId = setInterval(() => {
      this.tiempoRestante++;
    }, 1000);
  }

  /**
   * Muestra el alert cuando el tiempo termina
   */
  mostrarAlertaTiempoTerminado(): void {
    Swal.fire({
      title: 'Tiempo terminado',
      text: 'El tiempo del ejercicio ha finalizado.',
      icon: 'info',
      showConfirmButton: true,
      confirmButtonColor: '#3b82f6',
      confirmButtonText: 'Volver a ejercicios',
      didOpen: () => {
        const popup = document.querySelector('.swal2-popup') as HTMLElement;
        const backdrop = document.querySelector('.swal2-backdrop-show') as HTMLElement;
        if (popup) {
          popup.style.zIndex = '999999';
        }
        if (backdrop) {
          backdrop.style.zIndex = '999998';
        }
      }
    }).then(() => {
      this.volverAEjercicios();
    });
  }

  /**
   * Obtiene el formato MM:SS del temporizador
   */
  obtenerFormatoTiempo(): string {
    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;
    return `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
  }

  /**
   * Inicia la verificación periódica del empeoramiento de pacientes
   */
  iniciarVerificacionColoresPacientes(): void {
    this.intervalVerificacionColores = setInterval(() => {
      this.verificarYActualizarColoresPacientes();
    }, 5000); // Verificar cada 5 segundos
  }

  /**
   * Verifica y actualiza los colores de los pacientes según el tiempo de empeoramiento
   * El paciente empeora cada X minutos comenzando desde su color inicial
   * EXCEPTO: Si ha sido intervenido manualmente (color asignado en el modal)
   * 
   * IMPORTANTE: Verifica TODOS los pacientes del ejercicio, incluso los de otros escenarios
   * Ej: si Tempeora=3min y colorInicial=amarillo, empeora en min 3, 6, 9, etc.
   */
  verificarYActualizarColoresPacientes(): void {
    console.log('=== VERIFICACIÓN DE COLORES (cada 5 segundos) ===');
    console.log(`Tiempo transcurrido: ${this.obtenerFormatoTiempo()} (${this.tiempoRestante}s)`);
    console.log(`Total pacientes a verificar: ${this.todosPacientes.length}`);

    this.todosPacientes.forEach((paciente: any) => {
      // Si fue intervenido manualmente, no empeora automáticamente
      if (paciente.interveniuoManualmente) {
        console.log(`  🛡️ ${paciente.nombre}: Intervenido manualmente - NO empeora automáticamente`);
        return;
      }

      // No actualizar si el paciente ya es negro (peor estado)
      if (paciente.color === 'negro') {
        console.log(`  ⚫ ${paciente.nombre}: Ya está en NEGRO (fallecido) - Sin cambios`);
        return;
      }

      // Obtener el tiempo de empeoramiento del paciente (en minutos)
      const tiempoEmpeoramiento = paciente.Tempeora || 0;

      // Si no hay tiempo de empeoramiento definido, no hacer nada
      if (tiempoEmpeoramiento <= 0) {
        console.log(`  ${paciente.nombre}: Sin tiempo de empeoramiento definido - Sin cambios`);
        return;
      }

      // Convertir minutos a segundos
      const tiempoEmpeoraminutoEnSegundos = tiempoEmpeoramiento * 60;

      const colorActual = paciente.color || 'verde';
      const colorInicial = paciente.colorInicial || 'verde';
      const indiceInicial = this.coloresOrdenados.indexOf(colorInicial);
      const indiceActual = this.coloresOrdenados.indexOf(colorActual);

      // Calcular cuántas veces ha empeorado desde el color inicial
      // Si empezó en amarillo (índice 1) y está en amarillo (índice 1), ha empeorado 0 veces
      // Si empezó en amarillo (índice 1) y está en rojo (índice 2), ha empeorado 1 vez
      const vecesEmpeorrado = indiceActual - indiceInicial;

      // Próximo empeoramiento será en: tiempoEmpeora × (vecesEmpeorrado + 1)
      const proximoTiempoDeEmpeoramiento = tiempoEmpeoraminutoEnSegundos * (vecesEmpeorrado + 1);

      console.log(`  ${paciente.nombre}:`);
      console.log(`      - Tempeora: ${tiempoEmpeoramiento}min (${tiempoEmpeoraminutoEnSegundos}s)`);
      console.log(`      - Color inicial: ${colorInicial} (índice: ${indiceInicial})`);
      console.log(`      - Color actual: ${colorActual} (índice: ${indiceActual})`);
      console.log(`      - Veces empeorado: ${vecesEmpeorrado}`);
      console.log(`      - Próximo empeoramiento en: ${proximoTiempoDeEmpeoramiento}s`);

      // Si el tiempo transcurrido alcanza el próximo empeoramiento
      if (this.tiempoRestante >= proximoTiempoDeEmpeoramiento) {
        // Cambiar al siguiente color (peor) si no es el último (negro)
        if (indiceActual < this.coloresOrdenados.length - 1) {
          const nuevoColor = this.coloresOrdenados[indiceActual + 1];
          console.log(`      ✓ EMPEORAMIENTO: ${colorActual} → ${nuevoColor}`);
          paciente.color = nuevoColor;
          // Guardar en BD
          this.guardarColorPacienteEnBD(paciente);
        }
      } else {
        const tiempoFaltante = proximoTiempoDeEmpeoramiento - this.tiempoRestante;
        console.log(`      ⏳ Empeoramiento en: ${tiempoFaltante}s`);
      }
    });
    console.log('==========================================\n');
  }

  /**
   * Actualiza visualmente el color del paciente en la UI
   */
  private actualizarColorPacienteEnUI(paciente: any): void {
    const imgElement = this.pacienteImagenesMap.get(paciente.id);
    if (imgElement) {
      // Remover todas las clases de borde de color
      imgElement.classList.remove('border-black', 'border-red-600', 'border-yellow-400', 'border-green-600', 'border-transparent');

      // Agregar la nueva clase de borde
      const borderColor = this.colorBordeMap[paciente.color] || 'border-transparent';
      imgElement.classList.add(borderColor);

      console.log(`Color actualizado automáticamente para paciente ${paciente.nombre}: ${paciente.color}`);
    }
  }

  /**
   * Guarda el color actualizado del paciente en la BD
   */
  private guardarColorPacienteEnBD(paciente: any): void {
    // Aquí iría la llamada HTTP para actualizar el color en la BD
    // Por ejemplo:
    // this.pacientesService.actualizarColorPaciente(paciente.id, paciente.color).subscribe(...);
    // Por ahora solo registramos en consola
    console.log(`Guardando color actualizado en BD para paciente ${paciente.nombre}: ${paciente.color}`);
  }
  terminarEjercicio(): void {
    Swal.fire({
      title: '¿Terminar ejercicio?',
      text: '¿Estás seguro de que deseas terminar el ejercicio?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, terminar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const popup = document.querySelector('.swal2-popup') as HTMLElement;
        const backdrop = document.querySelector('.swal2-backdrop-show') as HTMLElement;
        if (popup) {
          popup.style.zIndex = '999999';
        }
        if (backdrop) {
          backdrop.style.zIndex = '999998';
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Guardar el tiempo transcurrido del ejercicio
        this.guardarTiempoEjercicio();
      }
    });
  }

  /**
   * Recolecta todas las acciones de TODOS los pacientes del ejercicio para guardarlas
   * Itera sobre todosPacientes, no solo los del escenario actual
   */
private recolectarAccionesPacientes(): any[] {
  const pacientesConAcciones: any[] = [];

  this.todosPacientes.forEach((paciente: any) => {
    const tieneAccionesUsuario =
      Array.isArray(paciente.acciones) && paciente.acciones.length > 0;

    const tieneColorManual =
      paciente.interveniuoManualmente === true && !!paciente.color;

    const haEmpeoradoAutomaticamente =
      paciente.interveniuoManualmente !== true &&
      paciente.color &&
      paciente.colorInicial &&
      paciente.color !== paciente.colorInicial;

    if (
      tieneAccionesUsuario ||
      tieneColorManual ||
      haEmpeoradoAutomaticamente
    ) {
      pacientesConAcciones.push({
        pacienteId: paciente.id,
        acciones: paciente.acciones || [],
        color: paciente.color || paciente.colorInicial || 'verde',
        empeoroAutomaticamente: haEmpeoradoAutomaticamente
      });
    }
  });

  console.log('Acciones recolectadas:', pacientesConAcciones);
  return pacientesConAcciones;
}
  /**
   * Guarda el tiempo transcurrido del ejercicio en la base de datos
   */
  guardarTiempoEjercicio(): void {
    // Obtener el tiempo en minutos y segundos
    const minutos = Math.floor(this.tiempoRestante / 60);
    const segundos = this.tiempoRestante % 60;

    console.log(`Guardando tiempo del ejercicio: ${minutos}m ${segundos}s (${this.tiempoRestante}s)`);

    // Llamar al servicio para guardar el tiempo en la BD
    this.ejerciciosService.guardarTiempoEjercicio(this.ejercicioId, this.tiempoRestante).subscribe({
      next: (response) => {
        console.log('Tiempo guardado correctamente:', response);
        const intentoId = response.intento_id;

        // Ahora guardar las acciones de los pacientes
        const pacientesAcciones = this.recolectarAccionesPacientes();

        if (pacientesAcciones.length > 0) {
          this.ejerciciosService.guardarAccionesIntento(intentoId, pacientesAcciones).subscribe({
            next: (accioResponse) => {
              console.log('Acciones guardadas correctamente:', accioResponse);
              this.volverAEjercicios();
            },
            error: (error) => {
              console.error('Error al guardar acciones:', error);
              // Aún así volver a ejercicios
              this.volverAEjercicios();
            }
          });
        } else {
          console.log('No hay acciones para guardar');
          this.volverAEjercicios();
        }
      },
      error: (error) => {
        console.error('Error al guardar el tiempo del ejercicio:', error);
        // Aún así volver a ejercicios
        this.volverAEjercicios();
      }
    });
  }

  /**
   * Vuelve a la página de ejercicios
   */
  volverAEjercicios(): void {
    this.router.navigate(['/ejercicios']);
  }

  /**
   * Cambia a la imagen anterior
   */
  imagenAnterior(): void {
    if (this.currentImageIndex > 0) {
      this.cambiarImagen(this.currentImageIndex - 1);
    }
  }

  /**
   * Cambia a la imagen siguiente
   */
  imagenSiguiente(): void {
    if (this.currentImageIndex < this.imagenesEjercicio.length - 1) {
      this.cambiarImagen(this.currentImageIndex + 1);
    }
  }

  /**
   * Cambia a una imagen específica y actualiza el panorama
   */
  cambiarImagen(indice: number): void {
    if (indice < 0 || indice >= this.imagenesEjercicio.length) {
      console.error('Índice de imagen inválido:', indice);
      return;
    }

    this.currentImageIndex = indice;
    const imagenActual = this.imagenesEjercicio[this.currentImageIndex];
    console.log(imagenActual)
    console.log(`Cambiando a imagen ${this.currentImageIndex + 1}: ${imagenActual.nombre_archivo}`);
    
    // Filtrar pacientes que pertenecen a esta imagen
    console.log(this.todosPacientes);
    this.pacientesUbicados = this.todosPacientes.filter(paciente => paciente.posicion.imagen == imagenActual.nombre_archivo);
    console.log(`Pacientes para imagen ${imagenActual.nombre_archivo}:`, this.pacientesUbicados);
    
    // Limpiar el mapa de imágenes
    this.pacienteImagenesMap.clear();
    
    // Reinicializar Marzipano con la nueva imagen y sus pacientes
    this.iniciarMarzipano(this.imagenesEjercicio);
  }
}





