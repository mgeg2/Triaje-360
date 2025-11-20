import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImagenesService } from 'app/core/imagenes/imagenes.service';
import { HttpEventType, HttpEvent } from '@angular/common/http';

@Component({
    selector     : 'example',
    standalone   : true,
    imports      : [CommonModule, ReactiveFormsModule, FormsModule],
    templateUrl  : './example.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ExampleComponent implements OnInit, OnDestroy
{
    user: User;
    form: FormGroup;
    progress = 0;
    result: any = null;
    error: string = '';

    private _unsuscribeAll: Subject<any> = new Subject<any>();

    constructor(
        private _userService: UserService,
        private _fb: FormBuilder,
        private _imagenesService: ImagenesService
    ) {}

    ngOnInit(){
        this._userService.user$
            .pipe(takeUntil(this._unsuscribeAll))
            .subscribe((user:User)=>{
                this.user=user;
            });

        this.form = this._fb.group({
            nombre: ['', Validators.required],
            descripcion: [''],
            tipo: [''],
            archivo: [null, Validators.required]
        });
    }

    onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        
        console.log(input);
        if (!input.files || input.files.length === 0) {
            this.form.patchValue({ archivo: null });
            return;
        }
        const file = input.files[0];
        console.log(file);
         this.form.get('archivo')?.setValue(file); 
        //this.form.patchValue({ archivo: file });
    }

    onSubmit() {
        this.error = '';
        this.result = null;
        this.progress = 0;

        if (this.form.invalid) {
            this.error = 'Formulario inválido. Completa los campos requeridos.';
            return;
        }

        const nuevaAsignatura = this.form.value;

        this._imagenesService.uploadImagen(nuevaAsignatura).subscribe({
            next: (event: HttpEvent<any>) => {
                if (event.type === HttpEventType.UploadProgress && event.total) {
                    this.progress = Math.round((100 * event.loaded) / event.total);
                } else if (event.type === HttpEventType.Response) {
                    this.result = event.body;
                    this.progress = 100;
                }
            },
            error: (err) => {
                this.error = err?.message || 'Error al subir imagen';
            }
        });
    }

    ngOnDestroy(): void {
        this._unsuscribeAll.next(null);
        this._unsuscribeAll.complete();
    }
}
