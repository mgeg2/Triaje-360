import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'app/core/user/user.service';

export const roleBasedRedirectGuard = () => {
    const router = inject(Router);
    const userService = inject(UserService);

    // Get the role from sessionStorage
    let role = sessionStorage.getItem('role');

    console.log('Guard - Role from sessionStorage:', role);

    // Redirect based on role
    if (role === 'admin') {
        console.log('Redirecting to asignaturas');
        router.navigate(['/usuarios']);
    } else if (role === 'prof') {
        console.log('Redirecting to ejercicios');
        router.navigate(['/ejercicios']);
    } else if (role === 'alu') {
        console.log('Redirecting to ejercicios');
        router.navigate(['/ejercicios']);
    } else {
        console.log('No role found, redirecting to example');
        router.navigate(['/sign-in']);
    }

    // Return false to prevent the component from being loaded
    return false;
};
