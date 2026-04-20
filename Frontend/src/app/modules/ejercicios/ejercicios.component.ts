import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AsignaturasService } from 'app/core/asignaturas/asignaturas.service';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { EjerciciosService } from 'app/core/ejercicios/ejercicios.service';
import { PacientesService } from 'app/core/pacientes/pacientes.service';
import { AudioService } from 'app/core/audio-manager/audio.service';
import { get } from 'lodash';
@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatInputModule, MatFormFieldModule, MatStepperModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatCheckboxModule, MatSelectModule],
  templateUrl: './ejercicios.component.html'
})
export class EjerciciosComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  asignaturas: any[] = [];
  user!: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  showModal = false;
  showAccionesModal = false;
  showImagenModal = false;
  showDeleteConfirmModal = false;
  ejercicioAEliminar: any = null;
  intentosLimitados = false;
  selectedAsignaturaId: string = '';
  esEdicion: boolean = false;
  ejercicio: any
  ejercicioCompleto: boolean = false;
  pacientes: any[] = [];
  pacientesEjercicio: any[] = [];
  pacientesEjercicioOriginal: any[] = []; // Almacenaremos la lista original sin modificaciones
  pacienteSeleccionado: any;
  empeoramientoLimitado: any;
  imagenSeleccionadaId: any = null;
  imagenseleccionadaIDsinExtension: any = null;
  pacientesColocados: { [key: string]: any } = {};
  pacientesColocadosPorImagen: { [imagenId: string]: { [key: string]: any } } = {};
  searchTermPacientes: string = '';
  pacientesFiltrados: any[] = [];
  ejerciciosPorAsignatura: { [key: string]: any[] } = {};
  constructor(private _asignaturasService: AsignaturasService, private _userService: UserService, private _ejerciciosService: EjerciciosService, private _pacientesService: PacientesService, private _audioService: AudioService, private cdr: ChangeDetectorRef, private _router: Router) { }
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    nombre: ['', Validators.required],
    fechaInicio: [null as any, Validators.required],
    fechaFin: [null as any, Validators.required],
    descripcion: ['', Validators.required],
    numeroIntentos: [''],
    asignatura: [''],
  });

  secondFormGroup = this._formBuilder.group({
    escenarios: this._formBuilder.control<any[]>([], Validators.required),
    ejercicio: [''],
  });

  thirdFormGroup = this._formBuilder.group({
    sonidos: this._formBuilder.control<any[]>([], Validators.required),
    ejercicio: [''],
  });

  ThirdFormGroup = this._formBuilder.group({
    id:['',Validators.required],
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    color: ['', Validators.required],
    accionesPaciente: this._formBuilder.control<any[]>([]),
    tiempoEmpeoramiento: [''],
    imagenSeleccionada: [null],
    ejercicio: [''],
  });

  imagenesEscenarios: any[] = [];
  imagenesPacientes: any[] = [];
  accionesPaciente: any[] = [];
  sonidosDisponibles: any[] = [];
  sonidosSeleccionados: any[] = [];

  colorOptions = [
    { value: 'verde', label: 'Verde', hex: '#22c55e' },
    { value: 'amarillo', label: 'Amarillo', hex: '#eab308' },
    { value: 'rojo', label: 'Rojo', hex: '#ef4444' },
    { value: 'negro', label: 'Negro', hex: '#000000' }
  ];

  ngOnInit(): void {
    this._userService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((user: User) => {
        this.user = user;
        console.log(this.user);
      });
    this.getAsignaturasfromprofesor();
    this.getAccionesPaciente();
    console.log(this.accionesPaciente);
  }
  getColorHex(colorName: string): string {
    const color = this.colorOptions.find(c => c.value === colorName);
    return color?.hex || '#000000';
  }

  /**
   * Getter para obtener los pacientes disponibles (sin los que ya están colocados)
   */
  get pacientesDisponibles(): any[] {
    const pacientesColocadosIds = new Set<string>();
    
    // Recolectar todos los IDs de pacientes colocados en cualquier imagen
    Object.values(this.pacientesColocadosPorImagen).forEach((imagenPacientes: any) => {
      Object.values(imagenPacientes).forEach((paciente: any) => {
        pacientesColocadosIds.add(paciente.id);
      });
    });
    
    // Filtrar pacient​esEjercicio original para no mostrar los colocados
    return this.pacientesEjercicioOriginal.filter(p => !pacientesColocadosIds.has(p.id));
  }

  getAsignaturasfromprofesor(): void {
    console.log(this.user.id);
    this._asignaturasService.getallfromprofesor(this.user.id).subscribe((data: any) => {
      console.log(data, "esto es data");
      this.asignaturas = data.map((asig: any) => ({ ...asig, expanded: false }));
      console.log(this.asignaturas);
    });
  }

  submitForm(event: any): void {

    console.log(event);
    if (event == 1) {
      // Actualizar validación antes de validar
      this.updateNumeroIntentosValidation();

      // Establecer el ID de la asignatura en el formulario
      this.firstFormGroup.patchValue({ asignatura: this.selectedAsignaturaId });

      console.log('Valores del formulario:', this.firstFormGroup.value);

      if (this.firstFormGroup.invalid) {
        console.log("Formulario invalido");
        // Marcar todos los controles como touched para mostrar errores
        this.firstFormGroup.markAllAsTouched();
        return;
      }
      
      // Preparar los datos para enviar (convertir fechas a string ISO)
      const formData = {
        ...this.firstFormGroup.value,
        fechaInicio: this.firstFormGroup.value.fechaInicio instanceof Date ? 
          this.firstFormGroup.value.fechaInicio.toISOString().split('T')[0] : 
          this.firstFormGroup.value.fechaInicio,
        fechaFin: this.firstFormGroup.value.fechaFin instanceof Date ? 
          this.firstFormGroup.value.fechaFin.toISOString().split('T')[0] : 
          this.firstFormGroup.value.fechaFin
      };
      
      if (this.esEdicion) {
        // Edición
        this._ejerciciosService.updateEjercicio(this.ejercicio, formData).subscribe((data: any) => {
          console.log(data);
          if (data.status == 200) {
            this.stepper.next();
            event++;
            this.getimagenes(event, this.ejercicio);
            console.log(event);
          }
        });
      } else {
        // Creación
        this._ejerciciosService.postEjercicio(formData, event).subscribe((data: any) => {
          console.log(data);
          if (data.status == 200) {
            this.stepper.next();
            event++;
            this.ejercicio = data.ejercicio.id;
            this.getimagenes(event, this.ejercicio);
            console.log(event);
          }
        });
      }
    }
    if (event == 2) {
      if (this.secondFormGroup.invalid) {
        // Marcar todos los controles como touched para mostrar errores
        this.secondFormGroup.markAllAsTouched();
        return;
      }
      console.log(this.ejercicio);
      this.secondFormGroup.patchValue({ ejercicio: this.ejercicio });
      this._ejerciciosService.postEjercicio(this.secondFormGroup.value, event).subscribe((data: any) => {
        console.log(data);
        if (data.status == 200) {
          this.stepper.next();
          this.getimagenes(2, this.ejercicio); // Para cargar sonidos
          this.getSonidosDisponibles();
        }
      });
    }
    if (event == 3) {
      // Validar selección de sonidos
      if (this.thirdFormGroup.get('sonidos')?.value?.length === 0) {
        this.thirdFormGroup.get('sonidos')?.setErrors({ required: true });
        this.thirdFormGroup.get('sonidos')?.markAsTouched();
        alert("Por favor selecciona al menos un sonido");
        return;
      }
      
      // Guardar sonidos
      this.thirdFormGroup.patchValue({ ejercicio: this.ejercicio });
      this._audioService.postSonidosToEjercicio({
        ejercicio: this.ejercicio,
        sonidos: this.thirdFormGroup.get('sonidos')?.value || []
      }).subscribe((data: any) => {
        console.log(data);
        if (data.status == 200) {
          this.stepper.next();
          this.getimagenes(4, this.ejercicio); // Para cargar imágenes de pacientes
          // Los pacientes ya fueron cargados en openCreateEjercicioModal
        }
      });
    }
    if (event == 4) {
      // Verificar si el usuario ha tocado algún campo del formulario
      const formularioTieneDatos = this.ThirdFormGroup.get('nombre')?.value || 
                                    this.ThirdFormGroup.get('descripcion')?.value ||
                                    this.ThirdFormGroup.get('color')?.value ||
                                    (this.ThirdFormGroup.get('accionesPaciente')?.value?.length > 0);
      
      // Si el usuario ha comenzado a completar el formulario, debe ser válido
      if (formularioTieneDatos && this.ThirdFormGroup.invalid) {
        this.ThirdFormGroup.markAllAsTouched();
        alert("Por favor completa la información del paciente");
        return;
      }
      
      // Verificar que el ejercicio tiene al menos un paciente
      this._ejerciciosService.getPacientesEjercicio(this.ejercicio).subscribe((data: any) => {
        console.log(data);
        if(data.length == 0){
          alert("Debe agregar al menos un paciente al ejercicio");
          return;
        }
        if (data.length > 0) {
          this.stepper.next();
          this.getimagenes(5, this.ejercicio);
          this.getPacientesEjercicio();
        }
      });
    }
    if (event == 5) {
      // Guardar las posiciones de los pacientes de todas las imágenes
      let totalPacientesColocados = 0;
      
      // Guardar pacientes de la imagen actual si hay alguno seleccionado
      if (this.imagenSeleccionadaId && Object.keys(this.pacientesColocados).length > 0) {
        Object.entries(this.pacientesColocados).forEach(([key, paciente]) => {
          const [fila, columna] = key.split('-').map(Number);
          this._ejerciciosService.locatePacienteInEjercicio(this.ejercicio, {
            pacienteId: paciente.id,
            imagenId: this.imagenSeleccionadaId,
            fila: fila,
            columna: columna
          }).subscribe((data: any) => {
            console.log('Posición guardada:', data);
          });
          totalPacientesColocados++;
        });
      }
      
      // Guardar pacientes de imágenes anteriores guardadas
      Object.entries(this.pacientesColocadosPorImagen).forEach(([imagenId, pacientesColocados]) => {
        Object.entries(pacientesColocados).forEach(([key, paciente]) => {
          const [fila, columna] = key.split('-').map(Number);
          this._ejerciciosService.locatePacienteInEjercicio(this.ejercicio, {
            pacienteId: paciente.id,
            imagenId: imagenId,
            fila: fila,
            columna: columna
          }).subscribe((data: any) => {
            console.log('Posición guardada:', data);
          });
          totalPacientesColocados++;
        });
      });

      if (totalPacientesColocados === 0) {
        alert("Debe colocar al menos un paciente en algún escenario");
        return;
      }

      const mensaje = this.esEdicion ? "Ejercicio actualizado correctamente" : "Ejercicio creado correctamente";
      alert(mensaje);
      
      // Solo marcar como completo si es creación (nueva)
      if (!this.esEdicion) {
        this.ejercicioCompleto = true;
      }
      
      this.closeNewEditModal();
      this.showModal = false;
      this.pacientesColocados = {};
      this.pacientesColocadosPorImagen = {};
      
      // Recargar ejercicios
      if (this.selectedAsignaturaId) {
        this.getEjerciciosByAsignatura(this.selectedAsignaturaId);
      }
    }
  }
  getimagenes(event: any, ejercicio: any): void {
    var tipo;
    if (event == 2) {
      tipo = "escenario"
      this._ejerciciosService.getImagenes(tipo).subscribe((data: any) => {
        console.log(data);
        this.imagenesEscenarios = data;
      });
    }
    if (event == 4) {
      tipo = "paciente"
      this._ejerciciosService.getImagenes(tipo).subscribe((data: any) => {
        console.log(data);
        this.imagenesPacientes = data;
      });
    }
    if (event == 5 && ejercicio) {
      this.imagenSeleccionadaId = null;
      this._ejerciciosService.getImagenesFromEjercicio(ejercicio).subscribe((data: any) => {
        console.log(data);
        this.imagenesEscenarios = data;
        
        // En modo edición, cargar las ubicaciones de los pacientes
        if (this.esEdicion) {
          this._ejerciciosService.getPacientesLocationInEjercicio(ejercicio).subscribe((locations: any) => {
            console.log('Ubicaciones cargadas:', locations);
            
            // Obtener pacientes del ejercicio
            this._ejerciciosService.getPacientesEjercicio(ejercicio).subscribe((pacientes: any) => {
              const imagenesConUbicaciones = new Set<string>();
              
              // Poblar pacientesColocadosPorImagen
              locations.forEach((location: any) => {
                const key = `${location.fila}-${location.columna}`;
                const pacienteCompleto = pacientes.find(p => p.id === location.paciente);
                
                if (pacienteCompleto) {
                  if (!this.pacientesColocadosPorImagen[location.imagen]) {
                    this.pacientesColocadosPorImagen[location.imagen] = {};
                  }
                  this.pacientesColocadosPorImagen[location.imagen][key] = pacienteCompleto;
                  imagenesConUbicaciones.add(location.imagen);
                }
              });
              
              // Seleccionar la primera imagen con ubicaciones
              if (imagenesConUbicaciones.size > 0) {
                const primerImagenConUbicacion = Array.from(imagenesConUbicaciones)[0];
                this.imagenSeleccionadaId = primerImagenConUbicacion;
                this.imagenseleccionadaIDsinExtension = this.imagenSeleccionadaId ? this.imagenSeleccionadaId.replace(/\.JPG$/i, '') : null;
                
                // Cargar pacientes de la imagen seleccionada
                if (this.pacientesColocadosPorImagen[this.imagenSeleccionadaId]) {
                  this.pacientesColocados = { ...this.pacientesColocadosPorImagen[this.imagenSeleccionadaId] };
                }
                
                console.log('Imagen seleccionada al cargar imágenes del ejercicio:', this.imagenSeleccionadaId);
                console.log('Pacientes colocados:', this.pacientesColocados);
              } else {
                // Si no hay ubicaciones guardadas, seleccionar la primera imagen
                this.imagenSeleccionadaId = data[0].nombre_archivo || null;
                this.imagenseleccionadaIDsinExtension = this.imagenSeleccionadaId ? this.imagenSeleccionadaId.replace(/\.JPG$/i, '') : null;
                this.pacientesColocados = {};
              }
            });
          });
        } else {
          // En modo creación, solo seleccionar la primera imagen
          this.imagenSeleccionadaId = data[0].nombre_archivo || null;
          this.imagenseleccionadaIDsinExtension = this.imagenSeleccionadaId ? this.imagenSeleccionadaId.split('.').slice(0, -1).join('.') : null;
        }
      });
    }
  }

  getSonidosDisponibles(): void {
    this._audioService.getAllAudios().subscribe((data: any) => {
      console.log('Sonidos disponibles:', data);
      this.sonidosDisponibles = data.data || data.audios || data;
    }, (error: any) => {
      console.error('Error al obtener sonidos:', error);
      this.sonidosDisponibles = [];
    });
  }

  toggleSonido(sonidoId: string): void {
    const sonoControl = this.thirdFormGroup.get('sonidos');
    const currentSonidos = sonoControl?.value || [];
    const index = currentSonidos.indexOf(sonidoId);

    if (index === -1) {
      // Agregar si no está presente
      sonoControl?.patchValue([...currentSonidos, sonidoId]);
    } else {
      // Remover si está presente
      const newSonidos = currentSonidos.filter((id: string) => id !== sonidoId);
      sonoControl?.patchValue(newSonidos);
      
      // Si estamos editando, eliminar del backend
      if (this.esEdicion && this.ejercicio) {
        this._ejerciciosService.removeSonidoFromEjercicio(this.ejercicio, sonidoId).subscribe(
          (data: any) => {
            console.log('Sonido eliminado del ejercicio:', data);
          },
          (error: any) => {
            console.error('Error al eliminar sonido:', error);
            alert('Error al eliminar el sonido del ejercicio');
          }
        );
      }
    }

    // Limpiar el error de required si se selecciona al menos un sonido
    if ((sonoControl?.value || []).length > 0) {
      sonoControl?.setErrors(null);
    }
  }

  isSonidoSelected(sonidoId: string): boolean {
    return (this.thirdFormGroup.get('sonidos')?.value || []).includes(sonidoId);
  }

  openCreateEjercicioModal(asignatura: any): void {
    this.esEdicion = false;
    this.selectedAsignaturaId = asignatura.id;
    console.log('Asignatura seleccionada:', asignatura.id);
    this.showModal = true;
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
    this.thirdFormGroup.reset();
    this.ThirdFormGroup.reset();
    this.pacientesEjercicio = [];
    this.pacientesColocados = {};
    this.pacientesColocadosPorImagen = {};
    this.intentosLimitados = false;
    this.empeoramientoLimitado = false;
    this.ejercicioCompleto = false;
    this.imagenSeleccionadaId = null;
    this.getSonidosDisponibles();
    
    // Cargar pacientes
    this._pacientesService.getPacientes().subscribe((data: any) => {
      console.log("pacientes de la bbdd",data);
      this.pacientes = data;
      this.pacientesFiltrados = [...data];
      console.log("pacientes filtrados",this.pacientesFiltrados);
    });
  }
  getAccionesPaciente(): void {
    this._pacientesService.getAccionesPaciente().subscribe((data: any) => {

      this.accionesPaciente = data;
    });
  }

  seleccionarPaciente(paciente: any): void {  
    console.log('Paciente seleccionado:', paciente);
    this.pacienteSeleccionado = paciente;
    console.log(this.pacienteSeleccionado);
this.ThirdFormGroup.patchValue({ id: this.pacienteSeleccionado.id });
console.log(this.ThirdFormGroup.value);
     const imagenCorrespondiente = this.imagenesPacientes.find(
    img => img.nombre_archivo === this.pacienteSeleccionado.nombre_archivo
  );
  
  console.log('Imagen correspondiente:', imagenCorrespondiente);
    this.ThirdFormGroup.patchValue({
      nombre: this.pacienteSeleccionado.nombre,
      descripcion: this.pacienteSeleccionado.descripcion,
      color: this.pacienteSeleccionado.color,
      imagenSeleccionada: imagenCorrespondiente.id || null,
      accionesPaciente: this.pacienteSeleccionado.accionesPaciente || [],
      tiempoEmpeoramiento: this.pacienteSeleccionado.Tempeora || null
    });
    this.empeoramientoLimitado = this.pacienteSeleccionado.Tempeora > 0;
  }
  selectEscenario(imagen: any): void {
    const escenariosControl = this.secondFormGroup.get('escenarios');
    const currentEscenarios = escenariosControl?.value || [];
    const index = currentEscenarios.indexOf(imagen.id);

    if (index === -1) {
      // Add if not present
      escenariosControl?.patchValue([...currentEscenarios, imagen.id]);
    } else {
      // Remove if presentgetAccionLabel
      const newEscenarios = currentEscenarios.filter((id: any) => id !== imagen.id);
      escenariosControl?.patchValue(newEscenarios);
    }
    // Manually trigger validation check if needed
    if (!escenariosControl?.value || escenariosControl?.value.length === 0) {
      escenariosControl?.setErrors({ required: true });
    }
  }

  // Método para obtener el orden de un escenario seleccionado
  getOrdenEscenario(imagenId: any): number {
    const escenariosControl = this.secondFormGroup.get('escenarios');
    const currentEscenarios = escenariosControl?.value || [];
    return currentEscenarios.indexOf(imagenId) + 1;
  }
  // Método para actualizar validación cuando cambia el checkbox
  updateNumeroIntentosValidation(): void {
    const numeroIntentosControl = this.firstFormGroup.get('numeroIntentos');

    console.log('Intentos limitados:', this.intentosLimitados);
    if (this.intentosLimitados) {
      numeroIntentosControl.setValidators([Validators.required, Validators.min(1)]);
    } else {
      numeroIntentosControl.clearValidators();
    }
    numeroIntentosControl.updateValueAndValidity();
  }
  updateEmpeoramientoValidation(): void {
    const empeoramientoControl = this.ThirdFormGroup.get('tiempoEmpeoramiento');

    console.log('Empeoramiento limitado:', this.empeoramientoLimitado);
    if (this.empeoramientoLimitado) {
      empeoramientoControl.setValidators([Validators.required, Validators.min(1)]);
    } else {
      empeoramientoControl.clearValidators();
    }
    empeoramientoControl.updateValueAndValidity();
    this.cdr.detectChanges();
  }

  toggleAsignatura(index: number): void {
    this.asignaturas[index].expanded = !this.asignaturas[index].expanded;
    
    // Cargar ejercicios si se expande y aún no están cargados
    if (this.asignaturas[index].expanded && !this.ejerciciosPorAsignatura[this.asignaturas[index].id]) {
      this.getEjerciciosByAsignatura(this.asignaturas[index].id);
    }
  }

  getEjerciciosByAsignatura(asignaturaId: string): void {
    this._ejerciciosService.getEjerciciosByAsignatura(asignaturaId).subscribe((data: any) => {
      this.ejerciciosPorAsignatura[asignaturaId] = data;
      console.log('Ejercicios por asignatura:', this.ejerciciosPorAsignatura);
    });
  }

  editarEjercicio(ejercicio: any): void {
    console.log('\n🔄 INICIANDO editarEjercicio con:', ejercicio);
    this.esEdicion = true;
    this.ejercicio = ejercicio.id;
    this.selectedAsignaturaId = ejercicio.asignatura;
    this.showModal = true;

    // Resetear formularios
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
    this.thirdFormGroup.reset();
    this.ThirdFormGroup.reset();
    this.pacientesEjercicio = [];
    this.pacientesEjercicioOriginal = [];
    this.pacientesColocados = {};
    this.pacientesColocadosPorImagen = {};
    this.intentosLimitados = ejercicio.numerointentos > 0;
    this.empeoramientoLimitado = false;
    this.ejercicioCompleto = false;
    this.imagenSeleccionadaId = null;

    // Convertir fechas al formato correcto
    const fechaInicio = new Date(ejercicio.fechaInicio);
    const fechaFin = new Date(ejercicio.fechaFin);

    // Cargar datos del ejercicio en el paso 1
    this.firstFormGroup.patchValue({
      nombre: ejercicio.nombre,
      fechaInicio: fechaInicio,
      fechaFin: fechaFin,
      descripcion: ejercicio.descripcion,
      numeroIntentos: ejercicio.numerointentos > 0 ? ejercicio.numerointentos : '',
      asignatura: ejercicio.asignatura
    });

    // Cargar imágenes de pacientes (en paralelo, no es muy crítico)
    this._ejerciciosService.getImagenes('paciente').subscribe((data: any) => {
      this.imagenesPacientes = data;
    });

    // Cargar imágenes de escenarios
    this._ejerciciosService.getImagenes('escenario').subscribe((data: any) => {
      this.imagenesEscenarios = data;
      
      // Cargar escenarios del ejercicio
      this._ejerciciosService.getImagenesFromEjercicio(ejercicio.id).subscribe((escenarios: any) => {
        const escenarioIds = escenarios.map((esc: any) => esc.imagen);
        this.secondFormGroup.patchValue({
          escenarios: escenarioIds,
          ejercicio: ejercicio.id
        });
        
        console.log('Escenarios cargados:', escenarioIds);
        console.log('Escenarios completos:', escenarios);

        this.getSonidosDisponibles();
        // Cargar sonidos del ejercicio
        this._audioService.getSonidosFromEjercicio(ejercicio.id).subscribe((sonidos: any) => {
          const sonidoIds = sonidos.map((sonido: any) => sonido.id);
          this.thirdFormGroup.patchValue({
            sonidos: sonidoIds,
            ejercicio: ejercicio.id
          });
          console.log('Sonidos cargados:', sonidoIds);
        });

        // Cargar pacientes del ejercicio
        this._ejerciciosService.getPacientesEjercicio(ejercicio.id).subscribe((pacientes: any) => {
          this.pacientesEjercicio = pacientes;
          this.pacientesEjercicioOriginal = [...pacientes]; // Guardar copia sin modificaciones
          console.log('Pacientes del ejercicio cargados:', pacientes);

this._pacientesService.getPacientes().subscribe((data: any) => {
      console.log("pacientes de la bbdd",data);
      this.pacientes = data;
      this.pacientesFiltrados = [...data];
      console.log("pacientes filtrados",this.pacientesFiltrados);
    });
          // Cargar ubicaciones de los pacientes
          this._ejerciciosService.getPacientesLocationInEjercicio(ejercicio.id).subscribe((locations: any) => {
            console.log('Ubicaciones cargadas desde BD:', locations);
            console.log('pacientes disponibles:', pacientes);
            
            // Poblar pacientesColocados y pacientesColocadosPorImagen
            const imagenesConUbicaciones = new Set<string>();
            
            locations.forEach((location: any) => {
              const key = `${location.fila}-${location.columna}`;
              const pacienteCompleto = pacientes.find(p => p.id === location.paciente);
              
             // console.log(`📍 Ubicación BD: paciente_id=${location.paciente}, imagen="${location.imagen}", fila=${location.fila}, columna=${location.columna} → KEY="${key}"`);
              
              if (pacienteCompleto) {
                //console.log(`   ✓ Paciente encontrado: "${pacienteCompleto.nombre}"`);
                
                // Siempre agregar a pacientesColocadosPorImagen
                if (!this.pacientesColocadosPorImagen[location.imagen]) {
                  this.pacientesColocadosPorImagen[location.imagen] = {};
                }
                this.pacientesColocadosPorImagen[location.imagen][key] = pacienteCompleto;
                //console.log(`   → Agregado a pacientesColocadosPorImagen["${location.imagen}"]["${key}"]`);
                
                imagenesConUbicaciones.add(location.imagen);
              } else {
                console.log(`   ✗ Paciente NO encontrado con id: ${location.paciente}`);
                console.log(`   IDs disponibles:`, pacientes.map(p => p.id));
              }
            });
            
            console.log('🎬 Imágenes con ubicaciones guardadas:', Array.from(imagenesConUbicaciones));
            
            // Si hay ubicaciones guardadas, establecer imagenSeleccionadaId a la primera imagen con ubicaciones
            if (imagenesConUbicaciones.size > 0) {
              const primerImagenConUbicacion = Array.from(imagenesConUbicaciones)[0];
              this.imagenSeleccionadaId = primerImagenConUbicacion;
              console.log('🖼️ Estableciendo imagenSeleccionadaId a:', this.imagenSeleccionadaId);
              
              // Ahora poblar pacientesColocados con la imagen seleccionada
              if (this.pacientesColocadosPorImagen[this.imagenSeleccionadaId]) {
                this.pacientesColocados = { ...this.pacientesColocadosPorImagen[this.imagenSeleccionadaId] };
                //console.log('✅ pacientesColocados población:');
                Object.entries(this.pacientesColocados).forEach(([k, v]: [string, any]) => {
                  //console.log(`   [${k}] = ${v.nombre}`);
                });
              }
            } else {
              console.log('⚠️ No hay ubicaciones guardadas');
            }
            
            console.log('=== ESTADO FINAL DE CARGA ===');
            console.log('imagenSeleccionadaId:', this.imagenSeleccionadaId);
            console.log('Claves en pacientesColocados:', Object.keys(this.pacientesColocados));
            console.log('pacientesColocados:', this.pacientesColocados);
          });
        });
      });
    });
  }

  closeNewEditModal(): void {
    // Si el ejercicio no fue completado y no estamos editando, eliminarlo
    if (!this.ejercicioCompleto && !this.esEdicion && this.ejercicio) {
      this._ejerciciosService.deleteEjercicio(this.ejercicio).subscribe(
        (data: any) => {
          console.log('Ejercicio incompleto eliminado:', data);
        },
        (error: any) => {
          console.error('Error al eliminar ejercicio incompleto:', error);
        }
      );
    }

    this.showModal = false;
    this.stepper.reset();
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
    this.thirdFormGroup.reset();
    this.ThirdFormGroup.reset();
    this.pacientesEjercicio = [];
    this.pacientesColocados = {};
    this.pacientesColocadosPorImagen = {};
    this.intentosLimitados = false;
    this.empeoramientoLimitado = false;
    this.imagenSeleccionadaId = null;
    this.ejercicio = null;
    this.ejercicioCompleto = false;
    this.esEdicion = false;
  }

  addPacienteToExercise(): void {
    
    this.ThirdFormGroup.patchValue({ ejercicio: this.ejercicio });
    const pacienteData = this.ThirdFormGroup.value;
    if (!this.empeoramientoLimitado) {
      pacienteData.tiempoEmpeoramiento = "0";
    }
    if (pacienteData.tiempoEmpeoramiento) {
        pacienteData.tiempoEmpeoramiento = pacienteData.tiempoEmpeoramiento;
      } else {
        pacienteData.tiempoEmpeoramiento = "0";
      }

    console.log('Paciente agregado al ejercicio:', pacienteData);
    this._ejerciciosService.postPacienteToEjercicio(pacienteData).subscribe((data: any) => {
      console.log(data);
      if (data.status == 200) {
        this.getPacientesEjercicio();
      }
    });
  }
 

  getPacientesEjercicio(): void {
    this._ejerciciosService.getPacientesEjercicio(this.ejercicio).subscribe((data: any) => {
      console.log(data);
      this.pacientesEjercicio = data;
      this.pacientesEjercicioOriginal = [...data]; // Guardar copia para pacientesDisponibles
    });
  }

  /**
   * Gets the label for an action by its ID
   * @param accionId - The ID of the action
   * @returns The label of the action
   */
  getAccionLabel(accionId: number): string {
    return this.accionesPaciente.find(a => a.id == accionId)?.nombre_accion || '';
  }

  /**
   * Abre el modal de selección de acciones
   */
  openAccionesModal(): void {
    this.showAccionesModal = true;
  }

  /**
   * Cierra el modal de selección de acciones
   */
  closeAccionesModal(): void {
    this.showAccionesModal = false;
  }

  /**
   * Abre el modal de selección de imagen de paciente
   */
  openImagenModal(): void {
    this.showImagenModal = true;
  }

  /**
   * Cierra el modal de selección de imagen de paciente
   */
  closeImagenModal(): void {
    this.showImagenModal = false;
  }

  /**
   * Obtiene las acciones disponibles (todas las acciones sin filtrar)
   * @returns Array de todas las acciones
   */
  getAccionesDisponibles(): any[] {
    return this.accionesPaciente;
  }

  /**
   * Agrega una acción a la lista de acciones seleccionadas
   * @param accionId - El ID de la acción a agregar
   */
  addAccion(accionId: number): void {
    const accionesControl = this.ThirdFormGroup.get('accionesPaciente');
    const currentAcciones = accionesControl?.value || [];
    
    accionesControl?.patchValue([...currentAcciones, accionId]);
    this.closeAccionesModal();
  }

  /**
   * Selecciona una imagen de paciente (una sola imagen permitida)
   * @param imagenId - El ID de la imagen a seleccionar
   */
  selectImagen(imagenId: number): void {
    this.ThirdFormGroup.patchValue({imagenSeleccionada: imagenId});
    this.closeImagenModal();
  }

  /**
   * Remueve una acción de la lista de acciones seleccionadas (solo una instancia)
   * @param accionId - El ID de la acción a remover
   */
  removeAccion(accionId: number): void {
    const accionesControl = this.ThirdFormGroup.get('accionesPaciente');
    const currentAcciones = accionesControl?.value || [];
    
    const index = currentAcciones.indexOf(accionId);
    if (index > -1) {
      const newAcciones = currentAcciones.slice();
      newAcciones.splice(index, 1);
      accionesControl?.patchValue(newAcciones);
    }
  }

  /**
   * Obtiene la imagen de paciente seleccionada
   * @returns El objeto imagen o undefined
   */
  getImagenSeleccionada(): any {
    const imagenId = this.ThirdFormGroup.get('imagenSeleccionada')?.value;
    //console.log('ID de imagen seleccionada:', imagenId);
    return this.imagenesPacientes.find(img => img.id === imagenId);
  }

  /**
   * Filtra los pacientes según el término de búsqueda (por nombre y descripción)
   * @param searchTerm - El término a buscar
   */
  filterPacientes(searchTerm: string): void {
    this.searchTermPacientes = searchTerm;
    if (!searchTerm || searchTerm.trim() === '') {
      this.pacientesFiltrados = [...this.pacientes];
    } else {
      const term = searchTerm.toLowerCase();
      this.pacientesFiltrados = this.pacientes.filter(paciente =>
        paciente.nombre?.toLowerCase().includes(term) ||
        paciente.descripcion?.toLowerCase().includes(term)
      );
    }
  }

  /**
   * Selecciona una imagen del escenario y deselecciona la anterior
   * @param imagenId - El ID de la imagen a seleccionar
   */
  seleccionarImagenEscenario(imagenId: any): void {
    console.log('Seleccionando imagen de escenario con ID:', imagenId);
    
    // Si estamos deseleccionando la misma imagen
    if (this.imagenSeleccionadaId === imagenId) {
      console.log('Deseleccionando imagen:', imagenId);
      // Guardar los pacientes colocados antes de deseleccionar
      if (Object.keys(this.pacientesColocados).length > 0) {
        this.pacientesColocadosPorImagen[imagenId] = { ...this.pacientesColocados };
        console.log('Pacientes guardados antes de deseleccionar:', this.pacientesColocadosPorImagen[imagenId]);
      }
      this.imagenSeleccionadaId = null;
      this.imagenseleccionadaIDsinExtension = null;
      this.pacientesColocados = {};
      return;
    }
    
    // Si ya hay una imagen seleccionada, guardar sus pacientes
    if (this.imagenSeleccionadaId) {
      if (Object.keys(this.pacientesColocados).length > 0) {
        this.pacientesColocadosPorImagen[this.imagenSeleccionadaId] = { ...this.pacientesColocados };
        console.log('Pacientes guardados para imagen anterior:', this.imagenSeleccionadaId, this.pacientesColocadosPorImagen[this.imagenSeleccionadaId]);
      }
    }
    
    // Limpiar los pacientes colocados actuales
    this.pacientesColocados = {};
    
    // Cargar los pacientes de la nueva imagen si existen
    if (this.pacientesColocadosPorImagen[imagenId]) {
      this.pacientesColocados = { ...this.pacientesColocadosPorImagen[imagenId] };
      console.log('Pacientes cargados para nueva imagen:', imagenId, this.pacientesColocados);
    }
    
    // Seleccionar la nueva imagen
    this.imagenSeleccionadaId = imagenId;
    // Remover extensión .JPG si existe
    this.imagenseleccionadaIDsinExtension = imagenId.replace(/\.JPG$/i, '');
    
    console.log('Imagen seleccionada:', this.imagenSeleccionadaId);
    console.log('Imagen sin extensión:', this.imagenseleccionadaIDsinExtension);
    console.log('Pacientes colocados por imagen:', this.pacientesColocadosPorImagen);
    console.log('Pacientes disponibles:', this.pacientesDisponibles.map((p: any) => p.nombre));
  }

  private draggedPaciente: any = null;

  /**
   * Inicia el arrastre de un paciente
   */
  onDragStart(event: DragEvent, paciente: any): void {
    this.draggedPaciente = paciente;
    console.log('onDragStart:', paciente.nombre);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'copy';
    }
  }

  /**
   * Finaliza el arrastre de un paciente
   */
  onDragEnd(event: DragEvent): void {
    console.log('onDragEnd');
  }

  /**
   * Maneja el drag enter en una celda
   */
  onDragEnter(event: DragEvent, row: number, col: number): void {
    const key = `${row}-${col}`;
    // Si la celda está ocupada, mostrar cursor prohibido
    if (this.pacientesColocados[key]) {
      event.dataTransfer!.dropEffect = 'none';
    } else {
      event.dataTransfer!.dropEffect = 'copy';
    }
  }

  /**
   * Maneja el drag over en una celda
   */
  onDragOver(event: DragEvent, row: number, col: number): void {
    event.preventDefault();
    const key = `${row}-${col}`;
    // Si la celda está ocupada, mostrar cursor prohibido
    if (this.pacientesColocados[key]) {
      event.dataTransfer!.dropEffect = 'none';
    } else {
      event.dataTransfer!.dropEffect = 'copy';
    }
  }

  /**
   * Maneja el drag leave en una celda
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
  }

  /**
   * Maneja el drop de un paciente en una celda del escenario
   * @param event - Evento de drop del HTML
   * @param row - La fila de la celda (1-indexed)
   * @param col - La columna de la celda (1-indexed)
   */
  onDrop(event: DragEvent, row: number, col: number): void {
    event.preventDefault();
    event.stopPropagation();
    console.log('onDrop ejecutado en celda', row, col, 'paciente dragueado:', this.draggedPaciente);
    
    if (!this.draggedPaciente) {
      console.error('No hay paciente dragueado');
      return;
    }

    const key = `${row}-${col}`;
    
    // Verificar si ya hay un paciente en la celda
    if (this.pacientesColocados[key]) {
      console.warn(`La celda ${row}-${col} ya contiene un paciente`);
      this.draggedPaciente = null;
      return;
    }

    this.pacientesColocados[key] = this.draggedPaciente;
    
    // Guardar en pacientesColocadosPorImagen
    if (!this.pacientesColocadosPorImagen[this.imagenSeleccionadaId]) {
      this.pacientesColocadosPorImagen[this.imagenSeleccionadaId] = {};
    }
    this.pacientesColocadosPorImagen[this.imagenSeleccionadaId][key] = this.draggedPaciente;
    
    console.log(`Paciente ${this.draggedPaciente.nombre} colocado en celda ${row}-${col}`, this.pacientesColocados);
    console.log('Pacientes disponibles después del drop:', this.pacientesDisponibles.map((p: any) => p.nombre));
    this.draggedPaciente = null;
  }

  /**
   * Maneja el click en una celda de la tabla del escenario para remover pacientes
   * @param row - La fila de la celda
   * @param col - La columna de la celda
   */
  onCellClick(row: number, col: number): void {
    const key = `${row}-${col}`;
    if (this.pacientesColocados[key]) {
      const paciente = this.pacientesColocados[key];
      delete this.pacientesColocados[key];
      
      // Remover también de pacientesColocadosPorImagen
      if (this.pacientesColocadosPorImagen[this.imagenSeleccionadaId]) {
        delete this.pacientesColocadosPorImagen[this.imagenSeleccionadaId][key];
      }
      
      console.log(`Paciente ${paciente.nombre} removido de la celda ${row}-${col}`);
      console.log('Pacientes disponibles después de remover:', this.pacientesDisponibles.map((p: any) => p.nombre));
    }
  }

  /**
   * Remueve un paciente del escenario y lo devuelve a su posición original
   * @param row - La fila de la celda
   * @param col - La columna de la celda
   */
  removePacienteDelEscenario(row: number, col: number): void {
    const key = `${row}-${col}`;
    if (this.pacientesColocados[key]) {
      const pacienteRemovido = this.pacientesColocados[key];
      delete this.pacientesColocados[key];
      
      // Remover también de pacientesColocadosPorImagen
      if (this.pacientesColocadosPorImagen[this.imagenSeleccionadaId]) {
        delete this.pacientesColocadosPorImagen[this.imagenSeleccionadaId][key];
      }
      
      console.log(`Paciente ${pacienteRemovido.nombre} removido de la celda ${row}-${col}`);
    }
  }

  /**
   * Obtiene el paciente colocado en una celda
   * @param row - La fila de la celda
   * @param col - La columna de la celda
   * @returns El paciente o undefined
   */
  getPacienteEnCelda(row: number, col: number): any {
    const key = `${row}-${col}`;
    const paciente = this.pacientesColocados[key];
    // if (paciente) {
    //   console.log(`✓ Encontrado paciente en celda [${row}-${col}]:`, paciente.nombre);
    // }
    return paciente;
  }

  /**
   * Obtiene el color de fondo de una celda
   * @param row - La fila de la celda
   * @param col - La columna de la celda
   * @returns El color de fondo en formato CSS
   */
  getCellBackground(row: number, col: number): string {
    const key = `${row}-${col}`;
    return this.pacientesColocados[key] ? 'rgba(100, 200, 255, 0.2)' : 'transparent';
  }

  /**
   * Genera un array de índices de 0 a 63 (4 filas x 16 columnas)
   */
  getCellIndices(): number[] {
    return Array.from({ length: 64 }, (_, i) => i);
  }

  /**
   * Convierte un índice lineal a número de fila (1-indexed)
   */
  getRowFromIndex(index: number): number {
    return Math.floor(index / 16) + 1;
  }

  /**
   * Convierte un índice lineal a número de columna (1-indexed)
   */
  getColFromIndex(index: number): number {
    return (index % 16) + 1;
  }

  /**
   * Navega al componente marzipano360 con el ID del ejercicio
   */
  navegarAMarzipano360(ejercicioId: string): void {
    this._router.navigate(['/marzipano360', ejercicioId]);
  }

  /**
   * Abre el modal de confirmación de eliminación
   */
  openDeleteConfirmModal(ejercicio: any): void {
    this.ejercicioAEliminar = ejercicio;
    this.showDeleteConfirmModal = true;
  }

  /**
   * Cierra el modal de confirmación de eliminación
   */
  closeDeleteConfirmModal(): void {
    this.showDeleteConfirmModal = false;
    this.ejercicioAEliminar = null;
  }

  /**
   * Elimina un paciente del ejercicio
   * @param pacienteId - El ID del paciente a eliminar
   */
  removePacienteFromExercise(pacienteId: any): void {
    // Buscar el paciente en el array de pacientes del ejercicio
    const pacienteAEliminar = this.pacientesEjercicio.find(p => p.id === pacienteId);
    
    if (!pacienteAEliminar) {
      console.error('Paciente no encontrado en el ejercicio');
      return;
    }

    // Limpiar todas las ubicaciones del paciente en pacientesColocados (escenario actual)
    Object.keys(this.pacientesColocados).forEach(key => {
      if (this.pacientesColocados[key]?.id === pacienteId) {
        delete this.pacientesColocados[key];
      }
    });

    // Limpiar todas las ubicaciones del paciente en pacientesColocadosPorImagen (todos los escenarios)
    Object.keys(this.pacientesColocadosPorImagen).forEach(imagenId => {
      Object.keys(this.pacientesColocadosPorImagen[imagenId]).forEach(key => {
        if (this.pacientesColocadosPorImagen[imagenId][key]?.id === pacienteId) {
          delete this.pacientesColocadosPorImagen[imagenId][key];
        }
      });
    });

    // Llamar al servicio para eliminar del backend
    this._ejerciciosService.removePacienteFromEjercicio(this.ejercicio, pacienteId).subscribe(
      (data: any) => {
        console.log('Paciente eliminado del ejercicio:', data);
        this.getPacientesEjercicio();
      },
      (error: any) => {
        console.error('Error al eliminar paciente:', error);
        alert('Error al eliminar el paciente del ejercicio');
      }
    );
  }

  /**
   * Elimina el ejercicio confirmado
   */
  eliminarEjercicio(): void {
    if (!this.ejercicioAEliminar) {
      return;
    }

    this._ejerciciosService.deleteEjercicio(this.ejercicioAEliminar.id).subscribe(
      (data: any) => {
        console.log('Ejercicio eliminado:', data);
        // Recargar los ejercicios de la asignatura a la que pertenece
        const asignaturaId = this.ejercicioAEliminar.asignatura;
        this.getEjerciciosByAsignatura(asignaturaId);
        this.closeDeleteConfirmModal();
      },
      (error: any) => {
        console.error('Error al eliminar ejercicio:', error);
        alert('Error al eliminar el ejercicio');
      }
    );
  }

  /**
   * Navega al componente de resultados
   */
  navegarAResultados(): void {
    this._router.navigate(['/resultados']);
  }
}
