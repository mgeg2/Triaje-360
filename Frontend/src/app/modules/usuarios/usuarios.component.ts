import { Component, inject, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule, FormGroup, ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UsuariosService } from 'app/core/usuarios/usuarios.service';

@Component({
  selector: 'app-usuarios',
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
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  private _formBuilder = inject(FormBuilder);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private _usuariosService = inject(UsuariosService);

  // Modal control
  showModal = false;
  showDeleteModal = false;
  isEditMode = false;
  idUsuario: number | null = null;
  usuarioToDelete: any = null;

  // Usuarios list
  usuarios: any[] = [];

  // Form
  usuariosForm!: FormGroup;

  // Filtros y búsqueda
  searchTerm: string = '';
  selectedRoles: string[] = [];
  sortBy: string = 'email';
  sortDirection: 'asc' | 'desc' = 'asc';
  showRoleDropdown: boolean = false;

  // Role options
  roleOptions = [
    { value: 'prof', label: 'Profesor' },
    { value: 'alu', label: 'Alumno' },
    { value: 'admin', label: 'Admin' }
  ];

  // Sort options
  sortOptions = [
    { value: 'email', label: 'Email (A-Z)' },
    { value: 'nickname', label: 'Nickname (A-Z)' },
    { value: 'role', label: 'Role (A-Z)' }
  ];

  ngOnInit(): void {
    this.initForm();
    this.loadUsuarios();
  }

  private initForm(): void {
    this.usuariosForm = this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      contraseña: ['', [Validators.required, Validators.minLength(6)]],
      repetirContraseña: ['', [Validators.required]],
      role: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator() });
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const contraseña = control.get('contraseña');
      const repetirContraseña = control.get('repetirContraseña');

      if (!contraseña || !repetirContraseña) {
        return null;
      }

      return contraseña.value === repetirContraseña.value ? null : { passwordMismatch: true };
    };
  }

  private extractNickname(email: string): string {
    return email.split('@')[0];
  }

  private loadUsuarios(): void {
    this._usuariosService.getUsuarios().subscribe({
      next: (response: any) => {
        console.log(response);
        this.usuarios = response.user;
        this._changeDetectorRef.markForCheck();
      },
      error: (error: any) => {
        console.error('Error al cargar usuarios:', error);
      }
    });
  }

  openNewEditModal(usuario?: any): void {
    if (usuario) {
      this.isEditMode = true;
      this.idUsuario = usuario.id;
      this.usuariosForm.patchValue({
        email: usuario.email,
        role: usuario.role
      });
      this.usuariosForm.get('contraseña')?.clearAsyncValidators();
      this.usuariosForm.get('repetirContraseña')?.clearAsyncValidators();
    } else {
      this.isEditMode = false;
      this.idUsuario = null;
      this.usuariosForm.reset();
    }
    this.showModal = true;
  }

  closeNewEditModal(): void {
    this.showModal = false;
    this.usuariosForm.reset();
    this.isEditMode = false;
    this.idUsuario = null;
  }

  saveUsuario(): void {
    if (this.usuariosForm.invalid) {
      return;
    }

    const formData = this.usuariosForm.value;
    
    // Extraer nickname del email
    const nickname = this.extractNickname(formData.email);
    
    // Preparar datos sin el campo repetirContraseña
    const datosEnvio = {
      nickname: nickname,
      email: formData.email,
      contraseña: formData.contraseña,
      role: formData.role
    };

    if (this.isEditMode && this.idUsuario) {
      // Actualizar usuario
      this._usuariosService.updateUsuario(this.idUsuario, datosEnvio).subscribe({
        next: (response: any) => {
          console.log('Usuario actualizado:', response);
          this.loadUsuarios();
          this.closeNewEditModal();
        },
        error: (error: any) => {
          console.error('Error al actualizar usuario:', error);
        }
      });
    } else {
      // Crear nuevo usuario
      this._usuariosService.createUsuario(datosEnvio).subscribe({
        next: (response: any) => {
          console.log('Usuario creado:', response);
          this.loadUsuarios();
          this.closeNewEditModal();
        },
        error: (error: any) => {
          console.error('Error al crear usuario:', error);
        }
      });
    }
  }

  deleteUsuario(usuario: any): void {
    this.usuarioToDelete = usuario;
    this.showDeleteModal = true;
  }

  confirmDelete(): void {
    if (this.usuarioToDelete) {
      // Eliminar usuario
      this._usuariosService.deleteUsuario(this.usuarioToDelete.id).subscribe({
        next: (response: any) => {
          console.log('Usuario eliminado:', response);
          this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioToDelete.id);
          this.showDeleteModal = false;
          this.usuarioToDelete = null;
          this._changeDetectorRef.markForCheck();
        },
        error: (error: any) => {
          console.error('Error al eliminar usuario:', error);
        }
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.usuarioToDelete = null;
  }

  editUsuario(usuario: any): void {
    this.openNewEditModal(usuario);
  }

  // Obtener usuarios filtrados y ordenados
  getFilteredAndSortedUsuarios(): any[] {
    let filtered = this.usuarios;

    // Filtro por roles (múltiples)
    if (this.selectedRoles.length > 0) {
      filtered = filtered.filter(u => this.selectedRoles.includes(u.role));
    }

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.email.toLowerCase().includes(term) ||
        u.nickname.toLowerCase().includes(term)
      );
    }

    // Ordenamiento simple
    filtered.sort((a, b) => {
      let valueA = a[this.sortBy];
      let valueB = b[this.sortBy];

      if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      let comparison = 0;
      if (valueA < valueB) comparison = -1;
      if (valueA > valueB) comparison = 1;

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }

  // Cambiar ordenamiento al hacer clic en el título (solo una columna)
  setSortBy(field: string): void {
    if (this.sortBy === field) {
      // Si es la misma columna, cambiar dirección
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es diferente, establecer nueva columna en ascendente
      this.sortBy = field;
      this.sortDirection = 'asc';
    }
  }

  // Métodos para manejar el multiselector de roles
  toggleRole(role: string): void {
    const index = this.selectedRoles.indexOf(role);
    if (index > -1) {
      this.selectedRoles.splice(index, 1);
    } else {
      this.selectedRoles.push(role);
    }
    // Cerrar el dropdown después de seleccionar
    this.closeRoleDropdown();
  }

  isRoleSelected(role: string): boolean {
    return this.selectedRoles.includes(role);
  }

  clearRoleFilters(): void {
    this.selectedRoles = [];
    // Cerrar el dropdown después de limpiar
    this.closeRoleDropdown();
  }

  getSortIcon(field: string): string {
    if (this.sortBy !== field) {
      return 'heroicons_outline:arrow-up';
    }
    return this.sortDirection === 'asc' 
      ? 'heroicons_outline:arrow-up' 
      : 'heroicons_outline:arrow-down';
  }
  // Toggle del dropdown de Role
  toggleRoleDropdown(): void {
    this.showRoleDropdown = !this.showRoleDropdown;
  }

  closeRoleDropdown(): void {
    this.showRoleDropdown = false;
  }

  getRoleLabel(roleValue: string): string {
    const role = this.roleOptions.find(r => r.value === roleValue);
    return role ? role.label : '';
  }

  // Cerrar dropdown cuando se hace click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const roleDropdownArea = document.querySelector('.role-dropdown-area');
    if (roleDropdownArea && !roleDropdownArea.contains(target)) {
      if (this.showRoleDropdown) {
        this.closeRoleDropdown();
      }
    }
  }
}