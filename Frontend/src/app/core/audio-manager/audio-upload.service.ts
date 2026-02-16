import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioUploadService {
  private uploadUrl = 'http://localhost:3000/api/audios/upload';
  private getAudiosUrl = 'http://localhost:3000/api/audios/bbdd';

  constructor(private http: HttpClient) { }

  uploadAudio(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('audio', file);

    const token = localStorage.getItem('token');
    const headers = token 
      ? new HttpHeaders({ 'Authorization': `${token}` })
      : new HttpHeaders();

    return this.http.post<any>(this.uploadUrl, formData, { headers });
  }

  getAllAudios(): Observable<any> {
    return this.http.get<any>(this.getAudiosUrl);
  }

  isValidAudioFormat(file: File): boolean {
    const allowedMimes = ['audio/wav', 'audio/mpeg', 'audio/mp4', 'video/mp4'];
    return allowedMimes.includes(file.type);
  }

  getAudioPath(fileName: string): string {
    console.log(`Obteniendo ruta para audio: ${fileName}`);
    return `/assets/sonidos/${fileName}`;
  }

  deleteAudio(audioId: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = token 
      ? new HttpHeaders({ 'Authorization': `${token}` })
      : new HttpHeaders();

    return this.http.delete<any>(`http://localhost:3000/api/audios/delete/${audioId}`, { headers });
  }
}
