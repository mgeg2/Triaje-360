import { add } from "lodash";

export const environment = {
    apiUrl: 'http://localhost:3000/api',
    usr: {
        login: '/users/login',
        all: '/users'
    },
    asig: {
        all: '/asignatures',
        addnew: '/asignatures',
        delete: '/asignatures'
    },
    ejer: {
        all: '/ejercicios',
        addnew: '/ejercicios',
        delete: '/ejercicios',
        imagenes: '/imagenes',
        addPaciente: '/ejercicios/paciente'
    },
    pac: {
        all: '/pacientes',
        addnew: '/pacientes',
        delete: '/pacientes',
        update: '/pacientes/',
        accionesPaciente: '/pacientes/accionesPaciente'
    },
    assets: {
        //assets:'c:/xampp/htdocs/TFG/Frontend/src/assets',
        assets:'assets'
    }
};
