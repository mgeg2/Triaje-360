import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { AsignaturasService } from 'app/core/asignaturas/asignaturas.service';

@Component({
  selector: 'app-asignaturas',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './asignaturas.component.html'
})
export class AsignaturasComponent implements OnInit {
  showModal = false;
  asignaturaForm: FormGroup;
  asignaturas: any[] = [];
  constructor(private fb: FormBuilder, private _asignaturesService:AsignaturasService ,) {
    this.asignaturaForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required]
    });
  }
ngOnInit(): void {
  this.getasignaturas();
}
  openModal() {
    this.showModal = true;
    this.asignaturaForm.reset();
  }

  closeModal() {
    this.showModal = false;
    this.asignaturaForm.reset();
  }

  submitForm() {
    if (this.asignaturaForm.invalid) {
      this.asignaturaForm.get('nombre')?.markAsTouched();
      this.asignaturaForm.get('apellido')?.markAsTouched();
      return;
    }
    // Aquí puedes manejar el envío del formulario
    // Por ahora solo cierra el modal
    this.closeModal();
  }
  getasignaturas() {
    this._asignaturesService.getall().subscribe((data:any) => {
      this.asignaturas = data;
      console.log(this.asignaturas);
    }
    );
    
  }
}
