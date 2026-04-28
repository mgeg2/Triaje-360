import { Route } from '@angular/router';
import { initialDataResolver } from 'app/app.resolvers';
import { AuthGuard } from 'app/core/auth/guards/auth.guard';
import { NoAuthGuard } from 'app/core/auth/guards/noAuth.guard';
import { roleBasedRedirectGuard } from 'app/core/auth/guards/role-based-redirect.guard';
import { LayoutComponent } from 'app/layout/layout.component';

// @formatter:off
/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const appRoutes: Route[] = [

    // Redirect empty path to '/example'
    { path: '' ,pathMatch: 'full', 
        canActivate: [roleBasedRedirectGuard],
        component: LayoutComponent},

    // Redirect signed-in user based on role
    //
    // After the user signs in, the sign-in page will redirect the user to the 'signed-in-redirect'
    // path. The roleBasedRedirectGuard will check the user's role and redirect to the appropriate
    // module (asignaturas for admin, ejercicios for prof/usu)
    { 
        path: 'signed-in-redirect', 
        pathMatch: 'full', 
        canActivate: [roleBasedRedirectGuard],
        component: LayoutComponent
    },

    // Auth routes for guests
    {
        path: '',
        canActivate: [NoAuthGuard],
        canActivateChild: [NoAuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'confirmation-required', loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes') },
            { path: 'forgot-password', loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes') },
            { path: 'reset-password', loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes') },
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes') }
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes') },
            { path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes') },
            { path: 'unlock-session', loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes') }
        ]
    },

    // Landing routes
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            { path: 'home', loadChildren: () => import('app/modules/landing/home/home.routes') },
        ]
    },
 

    // Admin routes
    {
        path: '',
        canActivate: [AuthGuard],
        canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'usuarios', loadChildren: () => import('app/modules/usuarios/usuarios.routes') },
            { path: 'asignaturas', loadChildren: () => import('app/modules/asignaturas/asignaturas.routes') },
            { path: 'ejercicios', loadChildren: () => import('app/modules/ejercicios/ejercicios.routes') },
            //{ path: 'resultados', loadChildren: () => import('app/modules/resultados/resultados.routes') },
            { path: 'pacientes', loadChildren: () => import('app/modules/pacientes/pacientes.routes') },
            { path: 'marzipano360/:id', loadChildren: () => import('app/modules/marzipano360/marzipano360.routes') },
            {path: 'image-manager', loadChildren: () => import('app/modules/image-manager/image-manager.routes') },
            {path: 'audio-manager', loadChildren: () => import('app/modules/audio-manager/audio-manager.routes') },
            {path: 'resultados', loadChildren: () => import('app/modules/resultados/resultados.routes') }
        ]
    }
];
