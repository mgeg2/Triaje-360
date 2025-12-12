import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroments';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class EjerciciosService {
    private _httpClient = inject(HttpClient);
    private _authService = inject(AuthService);

    getAllEjercicios(): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.get(`${environment.apiUrl}${environment.asig.all}`, { headers });
    }
    getImagenes(tipo: string): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.get(`${environment.apiUrl}${environment.ejer.all}${environment.ejer.imagenes}/${tipo}`, { headers });
    }

    postEjercicio(ejercicio: any, faseId: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.post(`${environment.apiUrl}${environment.ejer.addnew}/phase/${faseId}`, ejercicio, { headers });
    }
    postPacienteToEjercicio(pacienteData: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.post(`${environment.apiUrl}${environment.ejer.addPaciente}`, pacienteData, { headers });
    }
   getPacientesEjercicio(ejercicioId: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.get(`${environment.apiUrl}${environment.ejer.all}/${ejercicioId}/pacientes`, { headers });
    }
}