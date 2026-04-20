import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private uploadUrl = `${environment.apiUrl}/imagenes/upload`;
  private getImagesUrl = `${environment.apiUrl}/imagenes/bbdd`;

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

  uploadCubemapTiles(originalFile: File, faceBlobs: { [key: string]: Blob }): Observable<any> {
    const formData = new FormData();
    
    // Agregar el archivo original
    formData.append('image', originalFile);
    
    // Agregar cada blob del cubo con su nombre (l, r, u, d, b, f)
    Object.entries(faceBlobs).forEach(([faceName, blob]) => {
      formData.append('tiles', blob, `${faceName}.png`);
    });
    
    formData.append('imageType', 'escenario');

    const token = localStorage.getItem('token');
    const headers = token 
      ? new HttpHeaders({ 'Authorization': `${token}` })
      : new HttpHeaders();

    return this.http.post<any>(`${this.uploadUrl}/cubemap`, formData, { headers });
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
    
    // Detectar si es un cubemap (contiene "Tiles/")
    if (fileName.includes('Tiles/')) {
      // Para cubemaps, devolver la ruta al tile 'l' (left)
      return environment.assets.assets + `/${imageType}s/${fileName}/l.png`;
    }
    
    // Para imágenes normales de pacientes

    const hasExtension = /\.(png|jpg|jpeg|JPG|PNG|webp|WEBP)$/i.test(fileName);
    const fileNameWithExtension = hasExtension ? fileName : `${fileName}.JPG`;
    console.log(`Ruta construida para imagen (lo que voy a devolver): ${fileNameWithExtension}`);
    return environment.assets.assets + `/${imageType}s/${fileNameWithExtension}`;
  }

  deleteImage(imageId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = token 
      ? new HttpHeaders({ 'Authorization': `${token}` })
      : new HttpHeaders();

    return this.http.delete<any>(`${environment.apiUrl}/imagenes/delete/${imageId}`, { headers });
  }
}

