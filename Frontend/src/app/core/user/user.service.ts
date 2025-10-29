import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from 'app/core/user/user.types';
import { map, Observable, ReplaySubject, Subject, takeUntil, tap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { environment } from 'enviroments/enviroments';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _httpClient = inject(HttpClient);
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User) {
        console.log(value);
        // Store the value
        this._user.next(value);
        sessionStorage.setItem ("role",value.role);
        sessionStorage.setItem ("email",value.email);
        
    }

       get user$(): Observable<User> {
        return this._user.asObservable();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Get the current signed-in user data
     */
    get(): Observable<User> {
        return this._httpClient.get<User>('api/common/user').pipe(
            tap((user) => {
                this._user.next(user);
            })
        );
    }

     getall(): Observable<any> {
        let userToken:string='';

        this.user$
                    .pipe(takeUntil(this._unsubscribeAll))
                    .subscribe((user:User)=>{
                        userToken=user.token;
                        console.log(this.user);
                    })
                


        console.log(userToken);
        const headers = new HttpHeaders().set('Authorization', `${userToken}`);
        console.log(headers);
        return this._httpClient.get(environment.apiUrl + environment.usr.all, { headers });
    }
    
    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any> {
        return this._httpClient.patch<User>('api/common/user', { user }).pipe(
            map((response) => {
                this._user.next(response);
            })
        );
    }
}
