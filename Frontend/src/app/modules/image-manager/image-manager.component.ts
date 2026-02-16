import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageUploadService } from 'app/core/image-manager/image-upload.service';

@Component({
  selector: 'app-image-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './image-manager.component.html'
})
export class ImageManagerComponent implements OnInit {
  // Imágenes
  pacientesImages: any[] = [];
  escenariosImages: any[] = [];
  
  // Paginación
  itemsPerPage = 4;
  
  // Estado colapable
  pacientesExpandido = false;
  escenariosExpandido = false;
  pacientesPaginaActual = 1;
  escenariosPaginaActual = 1;
  
  // Modal
  showModal: boolean = false;
  currentImageType: 'paciente' | 'escenario' = 'paciente';
  
  // Formulario
  selectedFileName: string = '';
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isLoading: boolean = false;
  uploadSuccess: boolean = false;
  uploadError: string = '';

  imageForm!: FormGroup;

  constructor(
    private imageUploadService: ImageUploadService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.imageForm = this.formBuilder.group({
      imageInput: [null, Validators.required]
    });
    this.loadImages();
  }

  loadImages(): void {
    this.imageUploadService.getImagesByType('paciente').subscribe({
      next: (response) => {
        if (response.success) {
          this.pacientesImages = response.data || [];
          this.pacientesPaginaActual = 1;
        }
      },
      error: (error) => {
        console.error('Error al cargar imágenes de pacientes:', error);
      }
    });

    this.imageUploadService.getImagesByType('escenario').subscribe({
      next: (response) => {
        if (response.success) {
          this.escenariosImages = response.data || [];
          this.escenariosPaginaActual = 1;
        }
      },
      error: (error) => {
        console.error('Error al cargar imágenes de escenarios:', error);
      }
    });
  }

  // Paginación Pacientes
  get pacientesImagesPaginadas(): any[] {
    const inicio = (this.pacientesPaginaActual - 1) * this.itemsPerPage;
    return this.pacientesImages.slice(inicio, inicio + this.itemsPerPage);
  }

  get pacientesPaginasTotales(): number {
    return Math.ceil(this.pacientesImages.length / this.itemsPerPage);
  }

  // Paginación Escenarios
  get escenariosImagesPaginadas(): any[] {
    const inicio = (this.escenariosPaginaActual - 1) * this.itemsPerPage;
    return this.escenariosImages.slice(inicio, inicio + this.itemsPerPage);
  }

  get escenariosPaginasTotales(): number {
    return Math.ceil(this.escenariosImages.length / this.itemsPerPage);
  }

  openModal(imageType: 'paciente' | 'escenario'): void {
    this.currentImageType = imageType;
    this.showModal = true;
    this.resetForm();
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    const file = files[0];

    if (!this.imageUploadService.isValidImageFormat(file)) {
      this.uploadError = 'Solo se permiten archivos PNG o JPG';
      this.selectedFileName = '';
      this.selectedFile = null;
      this.previewUrl = null;
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.uploadError = '';
    this.uploadSuccess = false;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewUrl = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadImage(): void {
    if (!this.selectedFile || !this.selectedFileName) {
      this.uploadError = 'Por favor selecciona una imagen';
      return;
    }

    this.isLoading = true;
    this.uploadError = '';
    this.uploadSuccess = false;

    this.imageUploadService.uploadImage(this.selectedFile, this.currentImageType)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.uploadSuccess = true;
            this.uploadError = '';
            setTimeout(() => {
              this.closeModal();
              this.loadImages();
            }, 1500);
          } else {
            this.uploadError = response.error || 'Error al subir la imagen';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.uploadError = error.error?.error || 'Error al conectar con el servidor';
        }
      });
  }

  resetForm(): void {
    this.imageForm.reset();
    this.selectedFile = null;
    this.selectedFileName = '';
    this.previewUrl = null;
    this.uploadError = '';
    this.uploadSuccess = false;

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getImagePath(image: any): string {
    return this.imageUploadService.getImagePath(image.nombre_archivo, image.tipo);
  }

  deleteImage(imageId: string, imageName: string): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la imagen "${imageName}"?`)) {
      this.imageUploadService.deleteImage(imageId).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadImages();
          }
        },
        error: (error) => {
          console.error('Error al eliminar imagen:', error);
          alert('Error al eliminar la imagen');
        }
      });
    }
  }
}

