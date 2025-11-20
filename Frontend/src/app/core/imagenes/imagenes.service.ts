import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
    providedIn: 'root'
})
export class ImagenesService {
    private baseUrl = 'http://localhost:3000/api/imagenes';
    private http = inject(HttpClient);
    private auth = inject(AuthService);

    /**
     * Sube una imagen al backend. Espera un FormData con los campos necesarios.
     * Añade el token de autorización en la cabecera 'authorization'.
     */
    uploadImagen(formData: any): Observable<HttpEvent<any>> {
        const token = this.auth.accessToken || '';
        const headers = new HttpHeaders().set('authorization', token);
        
        return this.http.post<any>(this.baseUrl, formData, {
            headers,
           
        });
    }
}

