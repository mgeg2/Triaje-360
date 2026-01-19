import { Component, inject, OnInit, ViewChild } from '@angular/core';
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
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-ejercicios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatIconModule, MatInputModule, MatFormFieldModule, MatStepperModule, MatButtonModule, MatDatepickerModule, MatNativeDateModule, MatCheckboxModule, MatSelectModule, DragDropModule],
  templateUrl: './ejercicios.component.html'
})
export class EjerciciosComponent implements OnInit {
  @ViewChild('stepper') stepper!: MatStepper;
  asignaturas: any[] = [];
  user!: User;
  private _unsubscribeAll: Subject<any> = new Subject<any>();
  showModal = false;
  intentosLimitados = false;
  selectedAsignaturaId: string = '';
  ejercicio: any
  pacientes: any[] = [];
  pacientesEjercicio: any[] = [];
  pacienteSeleccionado: any;
  empeoramientoLimitado: any;
  imagenSeleccionadaId: any = null;
  pacientesColocados: { [key: string]: any } = {};
  constructor(private _asignaturasService: AsignaturasService, private _userService: UserService, private _ejerciciosService: EjerciciosService, private _pacientesService: PacientesService) { }
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
    accionesPaciente: [[]],
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
        }
        
        // this.closeNewEditModal();
      });

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
    this.imagenSeleccionadaId = null;
  }

  closeNewEditModal(): void {
    this.showModal = false;
  }

  addPacienteToExercise(): void {
    
    this.ThirdFormGroup.patchValue({ ejercicio: this.ejercicio });
    const pacienteData = this.ThirdFormGroup.value;
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
   * Selecciona una imagen del escenario y deselecciona la anterior
   * @param imagenId - El ID de la imagen a seleccionar
   */
  seleccionarImagenEscenario(imagenId: any): void {
    // Si es la misma imagen, deselecciona. Si es diferente, selecciona solo esa
    if (this.imagenSeleccionadaId === imagenId) {
      this.imagenSeleccionadaId = null;
    } else {
      this.imagenSeleccionadaId = imagenId;
    }
    console.log('Imagen seleccionada:', this.imagenSeleccionadaId);
  }

  /**
   * Maneja el drop de un paciente en una celda de la tabla
   * @param event - Evento de drop del CDK
   * @param row - La fila de la celda
   * @param col - La columna de la celda
   */
  onDrop(event: CdkDragDrop<any>, row: number, col: number): void {
    const paciente = event.item.data;
    const key = `${row}-${col}`;
    this.pacientesColocados[key] = paciente;
    console.log(`Paciente ${paciente.nombre} colocado en celda ${row}-${col}`);
  }

  /**
   * Maneja el click en una celda de la tabla del escenario para remover pacientes
   * @param row - La fila de la celda
   * @param col - La columna de la celda
   */
  onCellClick(row: number, col: number): void {
    const key = `${row}-${col}`;
    if (this.pacientesColocados[key]) {
      delete this.pacientesColocados[key];
      console.log(`Paciente removido de la celda ${row}-${col}`);
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
}
