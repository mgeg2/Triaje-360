import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private uploadUrl = 'http://localhost:3000/api/imagenes/upload';
  private getImagesUrl = 'http://localhost:3000/api/imagenes/bbdd';

  constructor(private http: HttpClient) { }

  uploadImage(file: File, imageType: 'paciente' | 'escenario'): Observable<any> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('imageType', imageType);

    const token = localStorage.getItem('token');
    const headers = token 
      ? new HttpHeaders({ 'Authorization': `${token}` })
      : new HttpHeaders();

    return this.http.post<any>(this.uploadUrl, formData, { headers });
  }

  getImagesByType(imageType: 'paciente' | 'escenario'): Observable<any> {
    return this.http.get<any>(`${this.getImagesUrl}/${imageType}`);
  }

  isValidImageFormat(file: File): boolean {
    const allowedMimes = ['image/png', 'image/jpeg'];
    return allowedMimes.includes(file.type);
  }

  getImagePath(fileName: string, imageType: 'paciente' | 'escenario'): string {
    console.log(`Obteniendo ruta para imagen: ${fileName} de tipo: ${imageType}`);
    return `/assets/${imageType}s/${fileName}`;
  }

  deleteImage(imageId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = token 
      ? new HttpHeaders({ 'Authorization': `${token}` })
      : new HttpHeaders();

    return this.http.delete<any>(`http://localhost:3000/api/imagenes/delete/${imageId}`, { headers });
  }
}

