import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../enviroments/enviroments';
import { AuthService } from '../auth/auth.service';
import { Observable, tap } from 'rxjs';

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

    getImagenesFromEjercicio(ejercicioId: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.get(`${environment.apiUrl}${environment.ejer.all}/${ejercicioId}/imagenes`, { headers });
    }
    locatePacienteInEjercicio(ejercicioId: any, pacienteData: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.post(`${environment.apiUrl}${environment.ejer.all}/${ejercicioId}/locatePaciente`, pacienteData, { headers });
    }

    getEjerciciosByAsignatura(asignaturaId: string): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        console.log("Fetching ejercicios for asignatura ID:", asignaturaId);
        return this._httpClient.get(`${environment.apiUrl}${environment.ejer.all}/asignaturas/${asignaturaId}`, { headers });
    }

    guardarTiempoEjercicio(ejercicioId: string, tiempoTranscurrido: number): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        const data = { tiempoTranscurrido };
        return this._httpClient.post(`${environment.apiUrl}${environment.ejer.all}/${ejercicioId}/tiempo`, data, { headers });
    }

    deleteEjercicio(ejercicioId: string): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.delete(`${environment.apiUrl}${environment.ejer.all}/${ejercicioId}`, { headers });
    }

    removePacienteFromEjercicio(ejercicioId: string, pacienteId: string): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.delete(`${environment.apiUrl}${environment.ejer.all}/${ejercicioId}/paciente/${pacienteId}`, { headers });
    }

    updateEjercicio(ejercicioId: string, ejercicio: any): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.put(`${environment.apiUrl}${environment.ejer.all}/${ejercicioId}`, ejercicio, { headers });
    }

    getPacientesLocationInEjercicio(ejercicioId: string): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        console.log(`📡 Llamando a getPacientesLocationInEjercicio para ejercicio: ${ejercicioId}`);
        return this._httpClient.get(`${environment.apiUrl}${environment.ejer.all}/${ejercicioId}/pacientesLocations`, { headers }).pipe(
            tap((data: any) => {
                console.log(`📥 Respuesta recibida de getPacientesLocationInEjercicio:`, data);
            })
        );
    }

    obtenerResultadosUsuario(): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.get(`${environment.apiUrl}${environment.ejer.all}/resultados/usuario`, { headers });
    }

    obtenerDetallesResultado(intentoId: string): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.get(`${environment.apiUrl}${environment.ejer.all}/resultados/${intentoId}`, { headers });
    }

    guardarAccionesIntento(intentoId: string, pacientesAcciones: any[]): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        const data = { pacientesAcciones };
        return this._httpClient.post(`${environment.apiUrl}${environment.ejer.all}/resultados/${intentoId}/acciones`, data, { headers });
    }

    removeSonidoFromEjercicio(ejercicioId: string, sonidoId: string): Observable<any> {
        const token = this._authService.accessToken;
        const headers = new HttpHeaders().set('Authorization', `${token}`);
        return this._httpClient.delete(`${environment.apiUrl}${environment.ejer.all}/${ejercicioId}/sonido/${sonidoId}`, { headers });
    }
}