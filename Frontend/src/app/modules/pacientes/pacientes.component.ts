import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { PacientesService } from 'app/core/pacientes/pacientes.service';
import { EjerciciosService } from 'app/core/ejercicios/ejercicios.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  templateUrl: './pacientes.component.html'
})
export class PacientesComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);

  // Modal control
  showModal = false;
  showDeleteModal = false;
  isEditMode = false;
  intentosLimitados = false;
  idpaciente = null;
  pacienteToDelete: any = null;
  // Pacientes list
  pacientes: any[] = [];

  // Acciones del paciente options
  accionesPacienteOptions: any[] = [];

  // Color options
  colorOptions = [
    { value: 'verde', label: 'Verde', hex: '#22c55e' },
    { value: 'amarillo', label: 'Amarillo', hex: '#eab308' },
    { value: 'rojo', label: 'Rojo', hex: '#ef4444' },
    { value: 'negro', label: 'Negro', hex: '#000000' }
  ];

  // Image options (static for now)
  imagenes: any[];

  // Helper method to get hex color from color name
  getColorHex(colorName: string): string {
    const color = this.colorOptions.find(c => c.value === colorName);
    return color?.hex || '#000000';
  }

  // Form groups
  PacienteForm = this._formBuilder.group({
    nombre: ['', Validators.required],
    descripcion: ['', Validators.required],
    color: ['', Validators.required],
    accionesPaciente: [[]],
    tiempoEmpeoramiento: [''],
    imagenSeleccionada: [null]
  });

  constructor(private _pacientesService: PacientesService, private _ejerciciosService: EjerciciosService) { }
  ngOnInit(): void {
    this.getimagenesPacientes();
    // Initialize component
    this.loadPacientes();
    this.getAccionesPaciente();
  }

  /**
   * Loads all patients from the service
   */
  loadPacientes(): void {
    this._pacientesService.getPacientes().subscribe(
      (response) => {
        this.pacientes = response;
        console.log('Pacientes cargados:', this.pacientes);
      },
      (error) => {
        console.error('Error al cargar pacientes:', error);
      }
    );
  }

  /**
   * Opens the modal for creating a new patient
   */
  openNewEditModal(): void {
    this.isEditMode = false;
    this.showModal = true;
    this.intentosLimitados = false;
    this.PacienteForm.reset();

  }

  /**
   * Opens the modal for editing an existing patient
   * @param paciente - The patient data to edit
   */
  openEditModal(paciente: any): void {
    console.log(paciente.accionesPaciente);
    this.isEditMode = true;
    this.showModal = true;
    this.PacienteForm.patchValue({
      nombre: paciente.nombre,
      descripcion: paciente.descripcion,
      color: paciente.color,
      accionesPaciente: paciente.accionesPaciente || [],
      tiempoEmpeoramiento: paciente.Tempeora,
      imagenSeleccionada: paciente.imagen || null
    });
    this.idpaciente = paciente.id;
    this.intentosLimitados = paciente.Tempeora > 0;
  }

  /**
   * Closes the modal
   */
  closeNewEditModal(): void {
    this.showModal = false;
    this.PacienteForm.reset();
    this.intentosLimitados = false;
  }

  openDeleteModal(paciente: any, event: Event): void {
    event.stopPropagation(); // Prevent opening the edit modal
    this.pacienteToDelete = paciente;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.pacienteToDelete = null;
  }

  confirmDelete(): void {
    if (this.pacienteToDelete) {
      this._pacientesService.deletePaciente(this.pacienteToDelete.id).subscribe(
        () => {
          console.log('Paciente eliminado');
          this.loadPacientes();
          this.closeDeleteModal();
        },
        (error) => {
          console.error('Error al eliminar paciente:', error);
        }
      );
    }
  }

  /**
   * Submits the form data
   */
  submitForm(): void {
    // Update validation before submitting
    this.updateNumeroIntentosValidation();

    if (this.PacienteForm.invalid) {
      console.log('Formulario inválido');
      this.PacienteForm.markAllAsTouched();
      return;
    }

    const formData = this.PacienteForm.value;
    console.log('Form data:', formData);

    if (this.isEditMode) {
      // TODO: Implement update logic
      console.log('Actualizando paciente:', formData);
      this._pacientesService.updatePaciente(this.idpaciente, formData).subscribe((response) => {
        console.log('Paciente actualizado:', response);
        this.loadPacientes(); // Actualiza la lista después de actualizar
        this.closeNewEditModal();
      },
        (error) => {
          console.error('Error al actualizar paciente:', error);
        });
    } else {
      if (formData.tiempoEmpeoramiento) {
        formData.tiempoEmpeoramiento = formData.tiempoEmpeoramiento;
      } else {
        formData.tiempoEmpeoramiento = "0";
      }
      // TODO: Implement create logic
      console.log('Creando paciente:', formData);
      this._pacientesService.CreatePaciente(formData).subscribe((response) => {
        console.log('Paciente agregado:', response);
        this.loadPacientes(); // Actualiza la lista después de agregar
        this.closeNewEditModal();
      },
        (error) => {
          console.error('Error al agregar paciente:', error);
        });
    }

    // Close modal after successful submission
    this.closeNewEditModal();
  }
  getimagenesPacientes() {
    var tipo = "paciente"
    this._ejerciciosService.getImagenes(tipo).subscribe(
      (response) => {
        this.imagenes = response;
        console.log('Imagenes cargadas:', this.imagenes);
      },
      (error) => {
        console.error('Error al cargar imagenes:', error);
      }
    );
  }
  /**
   * Updates the validation for numeroIntentos based on checkbox state
   */
  updateNumeroIntentosValidation(): void {
    const tiempoEmpeoramiento = this.PacienteForm.get('tiempoEmpeoramiento');

    if (this.intentosLimitados) {
      tiempoEmpeoramiento?.setValidators([Validators.required, Validators.min(1)]);
    } else {
      tiempoEmpeoramiento?.clearValidators();
      tiempoEmpeoramiento?.setValue('');
    }
    tiempoEmpeoramiento?.updateValueAndValidity();
  }
  getAccionesPaciente() {
    this._pacientesService.getAccionesPaciente().subscribe(
      (response) => {
        this.accionesPacienteOptions = response;
        console.log('Acciones del paciente cargadas:', this.accionesPacienteOptions);
      },
      (error) => {
        console.error('Error al cargar acciones del paciente:', error);
      }
    );
  }

  /**
   * Gets the label for an action by its ID
   * @param accionId - The ID of the action
   * @returns The label of the action
   */
  getAccionLabel(accionId: number): string {
    console.log(accionId);
    console.log(this.accionesPacienteOptions);
    return this.accionesPacienteOptions.find(a => a.id == accionId)?.nombre_accion || '';
  }
}
