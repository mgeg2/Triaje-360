import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AudioUploadService } from 'app/core/audio-manager/audio-upload.service';

@Component({
  selector: 'app-audio-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './audio-manager.component.html'
})
export class AudioManagerComponent implements OnInit {
  // Audios
  audios: any[] = [];
  
  // Paginación
  itemsPerPage = 4;
  paginaActual = 1;
  
  // Estado
  expandido = false;
  
  // Modal
  showModal: boolean = false;
  
  // Delete Confirmation Modal
  showDeleteConfirmModal: boolean = false;
  audioToDelete: { id: string; nombre_original: string } | null = null;
  
  // Delete Error Modal
  showDeleteErrorModal: boolean = false;
  deleteErrorMessage: string = '';
  
  // Formulario
  selectedFileName: string = '';
  selectedFile: File | null = null;
  isLoading: boolean = false;
  uploadSuccess: boolean = false;
  uploadError: string = '';

  audioForm!: FormGroup;

  constructor(
    private audioUploadService: AudioUploadService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.audioForm = this.formBuilder.group({
      audioInput: [null, Validators.required]
    });
    this.loadAudios();
  }

  loadAudios(): void {
    this.audioUploadService.getAllAudios().subscribe({
      next: (response) => {
        if (response.success) {
          this.audios = response.data || [];
          this.paginaActual = 1;
        }
      },
      error: (error) => {
        console.error('Error al cargar audios:', error);
      }
    });
  }

  // Paginación
  get audiosPaginadas(): any[] {
    const inicio = (this.paginaActual - 1) * this.itemsPerPage;
    return this.audios.slice(inicio, inicio + this.itemsPerPage);
  }

  get paginasTotales(): number {
    return Math.ceil(this.audios.length / this.itemsPerPage);
  }

  openModal(): void {
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

    if (!this.audioUploadService.isValidAudioFormat(file)) {
      this.uploadError = 'Solo se permiten archivos WAV, MP3 o MP4';
      this.selectedFileName = '';
      this.selectedFile = null;
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.uploadError = '';
    this.uploadSuccess = false;
  }

  uploadAudio(): void {
    if (!this.selectedFile || !this.selectedFileName) {
      this.uploadError = 'Por favor selecciona un audio';
      return;
    }

    this.isLoading = true;
    this.uploadError = '';
    this.uploadSuccess = false;

    this.audioUploadService.uploadAudio(this.selectedFile)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success) {
            this.uploadSuccess = true;
            this.uploadError = '';
            setTimeout(() => {
              this.closeModal();
              this.loadAudios();
            }, 1500);
          } else {
            this.uploadError = response.error || 'Error al subir el audio';
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.uploadError = error.error?.error || 'Error al conectar con el servidor';
        }
      });
  }

  resetForm(): void {
    this.audioForm.reset();
    this.selectedFile = null;
    this.selectedFileName = '';
    this.uploadError = '';
    this.uploadSuccess = false;

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getAudioPath(audio: any): string {
    const ext = audio.nombre_original.substring(audio.nombre_original.lastIndexOf('.')).toLowerCase();
    return this.audioUploadService.getAudioPath(audio.nombre_archivo + ext);
  }

  getAudioMimeType(audio: any): string {
    const ext = audio.nombre_original.substring(audio.nombre_original.lastIndexOf('.')).toLowerCase();
    const mimeTypes: { [key: string]: string } = {
      '.mp3': 'audio/mpeg',
      '.wav': 'audio/wav',
      '.mp4': 'audio/mp4'
    };
    return mimeTypes[ext] || 'audio/mpeg';
  }

  // Función para obtener duración del audio (si es necesario)
  getAudioDuration(audioPath: string): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.addEventListener('loadedmetadata', function() {
        resolve(this.duration);
      });
      audio.src = audioPath;
    });
  }

  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  deleteAudio(audioId: string, audioName: string): void {
    this.audioToDelete = { id: audioId, nombre_original: audioName };
    this.showDeleteConfirmModal = true;
  }

  confirmDeleteAudio(): void {
    if (!this.audioToDelete) return;

    this.audioUploadService.deleteAudio(this.audioToDelete.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeDeleteConfirmModal();
          this.loadAudios();
        }
      },
      error: (error) => {
        console.error('Error al eliminar audio:', error);
        this.deleteErrorMessage = 'Error al eliminar el audio';
        this.showDeleteErrorModal = true;
        this.closeDeleteConfirmModal();
      }
    });
  }

  closeDeleteConfirmModal(): void {
    this.showDeleteConfirmModal = false;
    this.audioToDelete = null;
  }

  closeDeleteErrorModal(): void {
    this.showDeleteErrorModal = false;
    this.deleteErrorMessage = '';
  }
}
