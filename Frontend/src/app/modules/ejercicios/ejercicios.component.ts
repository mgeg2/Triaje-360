import { Component, inject, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  intentosLimitados = false;
  selectedAsignaturaId: string = '';
  ejercicio: any
  pacientes: any[] = [];
  pacientesEjercicio: any[] = [];
  pacienteSeleccionado: any;
  empeoramientoLimitado: any;
  imagenSeleccionadaId: any = null;
  pacientesColocados: { [key: string]: any } = {};
  pacientesColocadosPorImagen: { [imagenId: string]: { [key: string]: any } } = {};
  searchTermPacientes: string = '';
  pacientesFiltrados: any[] = [];
  constructor(private _asignaturasService: AsignaturasService, private _userService: UserService, private _ejerciciosService: EjerciciosService, private _pacientesService: PacientesService, private cdr: ChangeDetectorRef) { }
  private _formBuilder = inject(FormBuilder);

  firstFormGroup = this._formBuilder.group({
    nombre: ['', Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    descripcion: ['', Validators.required],
    numeroIntentos: [''],
    asignatura: [''],
  });

  secondFormGroup = this._formBuilder.group({
    escenarios: this._formBuilder.control<any[]>([], Validators.required),
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
      this._ejerciciosService.postEjercicio(this.firstFormGroup.value, event).subscribe((data: any) => {
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
          event++;
          this.getimagenes(event, this.ejercicio);
          this.getPacientes();
        }
      });
    }
    if (event == 3) {
      if (this.ThirdFormGroup.invalid) {
        // Marcar todos los controles como touched para mostrar errores
        this.ThirdFormGroup.markAllAsTouched();
        return;
      }
      this._ejerciciosService.getPacientesEjercicio(this.ejercicio).subscribe((data: any) => {
        console.log(data);
        if(data.length == 0){
          alert("Debe agregar al menos un paciente al ejercicio");
          return;
          
        }
        if (data.length > 0) {
          //alert("Ejercicio creado correctamente");
          this.stepper.next();
          event++;
          this.getimagenes(event, this.ejercicio);
          this.getPacientesEjercicio();
        }
        
        // this.closeNewEditModal();
      });

    }
    if (event == 4) {
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

      alert("Ejercicio creado correctamente");
      this.closeNewEditModal();
      this.showModal = false;
      this.pacientesColocados = {};
      this.pacientesColocadosPorImagen = {};
      this.getPacientesEjercicio();
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
    if (event == 3) {
      tipo = "paciente"
      this._ejerciciosService.getImagenes(tipo).subscribe((data: any) => {
        console.log(data);
        this.imagenesPacientes = data;
      });
    }
    if (event == 4 && ejercicio) {
      this.imagenSeleccionadaId = null;
      this._ejerciciosService.getImagenesFromEjercicio(ejercicio).subscribe((data: any) => {
        console.log(data);
        this.imagenesEscenarios = data;
        this.imagenSeleccionadaId= data[0].nombre_imagen|| null;
      });
    }
  }
  getPacientes(): void {
    this._pacientesService.getPacientes().subscribe((data: any) => {
      console.log(data);
      this.pacientes = data;
      this.pacientesFiltrados = [...data];
    });
  }
  getAccionesPaciente(): void {
    this._pacientesService.getAccionesPaciente().subscribe((data: any) => {
      console.log(data);
      this.accionesPaciente = data;
    });
  }

  seleccionarPaciente(paciente: any): void {  
    this.pacienteSeleccionado = paciente;
    console.log(this.pacienteSeleccionado);
this.ThirdFormGroup.patchValue({ id: this.pacienteSeleccionado.id });
console.log(this.ThirdFormGroup.value);
     const imagenCorrespondiente = this.imagenesPacientes.find(
    img => img.nombre_imagen === this.pacienteSeleccionado.nombre_imagen
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
  }

  openCreateEjercicioModal(asig: any): void {
    this.selectedAsignaturaId = asig.id;
    console.log('Asignatura seleccionada:', asig.id);
    this.showModal = true;
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
    this.ThirdFormGroup.reset();
    this.pacientesEjercicio = [];
    this.pacientesColocados = {};
    this.intentosLimitados = false;
    this.empeoramientoLimitado = false;
    this.imagenSeleccionadaId = null;
  }

  closeNewEditModal(): void {
    this.showModal = false;
    this.stepper.reset();
    this.firstFormGroup.reset();
    this.secondFormGroup.reset();
    this.ThirdFormGroup.reset();
    this.pacientesEjercicio = [];
    this.pacientesColocados = {};
    this.intentosLimitados = false;
    this.empeoramientoLimitado = false;
    this.imagenSeleccionadaId = null;
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
    // Guardar el estado actual de pacientes colocados si hay una imagen seleccionada
    if (this.imagenSeleccionadaId && this.imagenSeleccionadaId !== imagenId) {
      // Guardar los pacientes colocados de la imagen anterior
      this.pacientesColocadosPorImagen[this.imagenSeleccionadaId] = { ...this.pacientesColocados };
      
      // Limpiar para que desaparezcan
      this.pacientesColocados = {};
      
      // Cargar los pacientes de la nueva imagen si existen
      if (this.pacientesColocadosPorImagen[imagenId]) {
        this.pacientesColocados = { ...this.pacientesColocadosPorImagen[imagenId] };
      }
    }
    
    // Si es la misma imagen, deselecciona. Si es diferente, selecciona solo esa
    if (this.imagenSeleccionadaId === imagenId) {
      this.imagenSeleccionadaId = null;
      // Guardar antes de deseleccionar
      this.pacientesColocadosPorImagen[imagenId] = { ...this.pacientesColocados };
      this.pacientesColocados = {};
    } else {
      this.imagenSeleccionadaId = imagenId;
    }
    console.log('Imagen seleccionada:', this.imagenSeleccionadaId);
    console.log('Pacientes colocados por imagen:', this.pacientesColocadosPorImagen);
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
    
    // Remover el paciente del array de pacientes disponibles
    const index = this.pacientesEjercicio.indexOf(this.draggedPaciente);
    if (index > -1) {
      this.pacientesEjercicio.splice(index, 1);
    }
    
    console.log(`Paciente ${this.draggedPaciente.nombre} colocado en celda ${row}-${col}`, this.pacientesColocados);
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
      // Devolver el paciente al array de pacientes disponibles
      this.pacientesEjercicio.push(paciente);
      console.log(`Paciente ${paciente.nombre} removido de la celda ${row}-${col}`);
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
    return this.pacientesColocados[key];
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
}
