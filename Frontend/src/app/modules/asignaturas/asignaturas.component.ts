import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { AsignaturasService } from 'app/core/asignaturas/asignaturas.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asignaturas',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    MatSnackBarModule,
     CommonModule
  ],
  templateUrl: './asignaturas.component.html',
  styles: [
    /* language=SCSS */
    `
            .inventory-grid {
                grid-template-columns: 48px auto 40px;

                @screen sm {
                    grid-template-columns: 48px auto 112px 72px;
                }

                @screen md {
                    grid-template-columns: 48px 112px auto 112px 72px;
                }

                @screen lg {
                    grid-template-columns: 20px 112px 112px 700px 96px 40px;
                }
                @screen xl {
                    grid-template-columns: 20px 112px 112px 500px 96px 40px;
                }
            }
        `,
  ]
})
export class AsignaturasComponent implements OnInit {
  showModal = false;
  // controls the confirm-delete modal
  showDeleteModal = false;
  asignaturaToDelete: any = null;
  // edit mode state
  isEditMode: boolean = false;
  editingId: any = null;
  asignaturaForm: FormGroup;
  asignaturas: any[] = [];
  matriculados: any[] = [];
  noMatriculados: any[] = [];
  // user modal state
  showUserModal: boolean = false;
  asignaturaSelected: any = null;

    // Remove user from asignatura
    removeUserFromAsignature(user: any) {
      if (!this.asignaturaSelected || !user) return;
      this._asignaturesService.removeUserFromAsignature(this.asignaturaSelected.id, user.id).subscribe(
        () => {
          this.getmatriculados(this.asignaturaSelected.id);
          this.getnomatriculados(this.asignaturaSelected.id);
        },
        (error) => {
          console.error('Error al eliminar usuario de la asignatura:', error);
        }
      );
    }

    // Add user to asignatura
    addUserToAsignature(user: any) {
      if (!this.asignaturaSelected || !user) return;
      this._asignaturesService.addUserToAsignature(this.asignaturaSelected.id, user.id).subscribe(
        () => {
          this.getmatriculados(this.asignaturaSelected.id);
          this.getnomatriculados(this.asignaturaSelected.id);
        },
        (error) => {
          console.error('Error al agregar usuario a la asignatura:', error);
        }
      );
    }
  constructor(private fb: FormBuilder, private _asignaturesService: AsignaturasService, private snackBar: MatSnackBar) {
    this.asignaturaForm = this.fb.group({
      nombre: ['', Validators.required],
      codigo: ['', Validators.required],
      curso: ['', Validators.required]
    });
  }
  ngOnInit(): void {
    this.getasignaturas();
  }
  openNewEditModal() {
    // Open modal for creating a new asignatura
    this.isEditMode = false;
    this.editingId = null;
    this.showModal = true;
    this.asignaturaForm.reset();
  }

  closeNewEditModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.editingId = null;
    this.asignaturaForm.reset();
  }

  submitForm() {
    if (this.asignaturaForm.invalid) {
      this.asignaturaForm.get('nombre')?.markAsTouched();
      this.asignaturaForm.get('codigo')?.markAsTouched();
      this.asignaturaForm.get('curso')?.markAsTouched();
      return;
    }
    // Aquí puedes manejar el envío del formulario
    // Por ahora solo cierra el modal
    const nuevaAsignatura = this.asignaturaForm.value;
    if (this.isEditMode && this.editingId) {
      // Update existing asignatura
      this._asignaturesService.update(this.editingId, nuevaAsignatura).subscribe(
        (response) => {
          console.log('Asignatura actualizada:', response);
          this.getasignaturas();
          this.closeNewEditModal();
        },
        (error) => {
          console.error('Error al actualizar asignatura:', error);
        }
      );
    } else {
      // Create new asignatura
      this._asignaturesService.addnew(nuevaAsignatura).subscribe(
        (response) => {
          console.log('Asignatura agregada:', response);
          this.getasignaturas(); // Actualiza la lista después de agregar una nueva asignatura
          this.closeNewEditModal();
        },
        (error) => {
          console.error('Error al agregar asignatura:', error);
        }
      );
    }
  }
  getasignaturas() {
    this._asignaturesService.getall().subscribe((data: any) => {
      this.asignaturas = data;
      console.log(this.asignaturas);
    }
    );

  }
  /**
   * Open confirmation modal for deleting an asignatura
   * We accept the whole object so we can show its name in the dialog
   */
  openDeleteModal(asignatura: any) {
    this.asignaturaToDelete = asignatura;
    this.showDeleteModal = true;
  }

  /**
   * Open modal in edit mode and populate form
   */
  editAsignatura(asignatura: any) {
    if (!asignatura) {
      return;
    }
    this.isEditMode = true;
    this.editingId = asignatura.id;
    this.showModal = true;
    // Patch form with existing data
    this.asignaturaForm.patchValue({
      nombre: asignatura.nombre || '',
      codigo: asignatura.codigo || '',
      curso: asignatura.curso || ''
    });
  }

  /**
   * Show a small modal with asignatura info (name bold, code small and lighter)
   */
  showAsignatura(asignatura: any) {
    if (!asignatura) return;
    this.asignaturaSelected = asignatura;
    this.showUserModal = true;
    this.getmatriculados(asignatura.id);
    this.getnomatriculados(asignatura.id);
  }

  closeUserModal() {
    this.showUserModal = false;
    this.asignaturaSelected = null;
  }

  /**
   * User confirmed deletion. Call service to delete and refresh list.
   */
  confirmDelete() {
    if (!this.asignaturaToDelete) {
      this.showDeleteModal = false;
      return;
    }
    const id = this.asignaturaToDelete.id;
    this._asignaturesService.delete(id).subscribe(
      () => {
        // refresh list
        this.getasignaturas();
        this.showDeleteModal = false;
        this.asignaturaToDelete = null;
        // Show success message
        this.snackBar.open('Asignatura eliminada correctamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        });
      },
      (error) => {
        console.error('Error al eliminar asignatura:', error);
        // Extract error message from response
        const errorMessage = error.error?.message || 'Error al eliminar la asignatura';
        // Show error message in snackbar
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'bottom',
          panelClass: ['error-snackbar']
        });
        // close modal even if error
        this.showDeleteModal = false;
        this.asignaturaToDelete = null;
      }
    );
  }
getmatriculados(idAsignatura: any) {
    this._asignaturesService.getUsuariosAsignatura(idAsignatura).subscribe((data: any) => {
      this.matriculados = Object.values(data);

      console.log(this.matriculados);
      return this.matriculados;
    });
  }

  getnomatriculados(idAsignatura: any) {
    this._asignaturesService.getNoUsuariosAsignatura(idAsignatura).subscribe((data: any) => {
      this.noMatriculados = Object.values(data);
      console.log(this.noMatriculados);
    });
  }

  /**
   * Cancel deletion flow
   */
  cancelDelete() {
    this.showDeleteModal = false;
    this.asignaturaToDelete = null;
  }

  
  /**
    * Track by function for ngFor loops
    *
    * @param index
    * @param item
    */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
