import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroments';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
    private _httpClient = inject(HttpClient);
    private _authService = inject(AuthService);
    private _baseUrl = environment.apiUrl;

    constructor() { }

    /**
     * Obtener todos los usuarios
     */
    getUsuarios(): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.get(this._baseUrl + environment.usr.all, { headers });
    }

    // /**
    //  * Obtener un usuario por ID
    //  */
    // getUsuario(id: number): Observable<any> {
    //     const token = this._authService.accessToken;
    //     const headers = new HttpHeaders().set('Authorization', `${token}`);
    //     return this._httpClient.get(`${this._baseUrl}/usuarios/${id}`, { headers });
    // }

    /**
     * Crear un nuevo usuario
     */
    createUsuario(usuario: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.post(`${this._baseUrl}${environment.usr.all}`, usuario, { headers });
    }

    /**
     * Actualizar un usuario existente
     */
    updateUsuario(id: number, usuario: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.put(`${this._baseUrl}${environment.usr.all}/${id}`, usuario, { headers });
    }

    /**
     * Eliminar un usuario
     */
    deleteUsuario(id: number): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.delete(`${this._baseUrl}${environment.usr.all}/${id}`, { headers });
    }

}
