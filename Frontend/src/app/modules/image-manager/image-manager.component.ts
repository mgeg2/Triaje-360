import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ImageUploadService } from 'app/core/image-manager/image-upload.service';
import equirectToCubemapFaces from 'equirect-cubemap-faces-js';

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

    // Si es una imagen de escenario, procesar con equirect-cubemap-faces
    if (this.currentImageType === 'escenario') {
      this.processEquirectangularImage(this.selectedFile);
    } else {
      // Para pacientes, subir normal
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
  }

  processEquirectangularImage(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Procesar la imagen equirectangular en 6 caras del cubo
          const cubeCanvas = equirectToCubemapFaces(img, 512); // 512px por cara
          
          console.log('Canvas retornados por librería:', cubeCanvas);
          console.log('Canvas[0]:', cubeCanvas[0]);
          console.log('Canvas[1]:', cubeCanvas[1]);
          console.log('Canvas[2]:', cubeCanvas[2]);
          console.log('Canvas[3]:', cubeCanvas[3]);
          console.log('Canvas[4]:', cubeCanvas[4]);
          console.log('Canvas[5]:', cubeCanvas[5]);
          
          // Extraer los 6 canvas de las caras (en el orden que devuelve la librería)
          const faces = {
            l: cubeCanvas[0], // left
            r: cubeCanvas[1], // right
            d: cubeCanvas[2], // down
            u: cubeCanvas[3], // up
            f: cubeCanvas[4], // front
            b: cubeCanvas[5]  // back
          };

          // Convertir los canvas a blobs
          const faceBlobs: { [key: string]: Blob } = {};
          let completedFaces = 0;

          Object.entries(faces).forEach(([faceName, canvas]) => {
            canvas.toBlob((blob: Blob | null) => {
              if (blob) {
                faceBlobs[faceName] = blob;
              }
              completedFaces++;

              // Cuando todas las caras estén procesadas, enviar al servidor
              if (completedFaces === 6) {
                this.uploadCubemapFaces(faceBlobs);
              }
            }, 'image/png');
          });
        } catch (error) {
          this.isLoading = false;
          this.uploadError = 'Error al procesar la imagen equirectangular';
          console.error('Error procesando equirectangular:', error);
        }
      };
      img.onerror = () => {
        this.isLoading = false;
        this.uploadError = 'Error al cargar la imagen';
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  uploadCubemapFaces(faceBlobs: { [key: string]: Blob }): void {
    if (!this.selectedFile) {
      this.uploadError = 'Archivo no disponible';
      return;
    }
    this.imageUploadService.uploadCubemapTiles(this.selectedFile, faceBlobs)
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
            this.uploadError = response.error || 'Error al subir los tiles';
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

