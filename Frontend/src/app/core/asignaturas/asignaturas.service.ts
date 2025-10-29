import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroments';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class AsignaturasService {
	 private _httpClient = inject(HttpClient);
     private _authService = inject(AuthService);

    getall(): Observable<any> {
        const token = this._authService.accessToken;
        console.log(token);
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        console.log(headers);
        return this._httpClient.get(environment.apiUrl + environment.asig.all, { headers });
    }

    addnew(asignatura: any): Observable<any> {
        const token = this._authService.accessToken;
        console.log(token);
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        console.log(headers);
        return this._httpClient.post(environment.apiUrl + environment.asig.addnew, asignatura, { headers });
    }

    delete(id: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        // Construct DELETE URL: environment.apiUrl + environment.asig.delete + '/' + id
        return this._httpClient.delete(`${environment.apiUrl}${environment.asig.delete}/${id}`, { headers });
    }

    update(id: any, asignatura: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        // PUT to update asignatura by id
        return this._httpClient.put(`${environment.apiUrl}${environment.asig.addnew}/${id}`, asignatura, { headers });
    }

    /**
     * Get alumnos (students) assigned to an asignatura
     */
    getUsuariosAsignatura(idAsignatura: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        // Endpoint: /api/asignatures/alu/:id
        return this._httpClient.get(`${environment.apiUrl}${environment.asig.all}/users/${idAsignatura}`, { headers });
    }

    /**
     * Get all users (admin endpoint)
     */
    getAllUsers(): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.get(`${environment.apiUrl}/users`, { headers });
    }

}