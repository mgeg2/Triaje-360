import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { catchError, Observable, of, switchMap, throwError } from 'rxjs';
import { environment } from '../../../enviroments/enviroments';


@Injectable({ providedIn: 'root' })
export class AuthService {
    private _authenticated: boolean = false;
    private _httpClient = inject(HttpClient);
    private _userService = inject(UserService);

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string) {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string {
        var token = localStorage.getItem('accessToken');
        
        if (token === null) {
            return '';
        }
        return token  

    }
    set authenticated(value: boolean) {
        this._authenticated = value;
    }   
    get authenticated(): boolean {
        return this._authenticated;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any> {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any> {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any> {
        // Throw error, if the user is already logged in
        if (this._authenticated) {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post(environment.apiUrl+environment.usr.login, credentials).pipe(
            switchMap((response: any) => {
                console.log(response);
                // Store the access token in the local storage
                 this.accessToken = response.token;
               localStorage.setItem('role', response.user.role);
               localStorage.setItem('accessToken', response.token);
               localStorage.setItem('email', response.user.email);
               localStorage.setItem('id', response.user.id);
                // // Set the authenticated flag to true
                 this._authenticated = true;
               
                // // Store the user on the user service
                this._userService.user = response.user;
                

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken() {
        var token = localStorage.getItem('accessToken');
        
        if (!token) {
            return of(false);
        }

        // Enviar el token al backend para verificación y descodificación
        return this._httpClient.post(environment.apiUrl + '/users/verify-token', { token }).pipe(
            switchMap((response: any) => {
                if (response.tokenValid) {
                    // Si el token es válido, guardar el contenido descodificado
                    this._authenticated = true;
                    
                    // Guardar el token re-cifrado
                    this.accessToken = response.encryptedToken;
                    
                    // Guardar el contenido del token
                    const { id, email, nickname, role } = response.content;
                    localStorage.setItem('role', role);
                    localStorage.setItem('email', email);
                    localStorage.setItem('id', id);
                    localStorage.setItem('nickname', nickname);
                    
                    // Actualizar el servicio de usuario
                    this._userService.user = {
                        email: email,
                        nickname: nickname,
                        role: role,
                        id: id,
                        token: response.encryptedToken
                    };
                    
                    return of(true);
                } else {
                    return of(false);
                }
            }),
            catchError(() => {
                // Si hay error en la verificación, limpiar datos
                localStorage.removeItem('accessToken');
                localStorage.removeItem('role');
                localStorage.removeItem('email');
                localStorage.removeItem('id');
                localStorage.removeItem('nickname');
                this._authenticated = false;
                return of(false);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any> {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('id');
        localStorage.removeItem('nickname');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: {
        name: string;
        email: string;
        password: string;
        company: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/sign-up', user);
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: {
        email: string;
        password: string;
    }): Observable<any> {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check() {
        // Check if the user is logged in
        if (this._authenticated) {
            return of(true);
        }

        // Check the access token availability
        if (!this.accessToken) {
            return of(false);
        }

        // Check the access token expire date
        if (AuthUtils.isTokenExpired(this.accessToken)) {
            return of(false);
        }

        // If the access token exists, and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
