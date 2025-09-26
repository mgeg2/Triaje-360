import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { UserService } from 'app/core/user/user.service';
import { User } from 'app/core/user/user.types';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector     : 'example',
    standalone   : true,
    templateUrl  : './example.component.html',
    encapsulation: ViewEncapsulation.None,
})
export class ExampleComponent implements OnInit
{
    user:User;
    private _unsuscribeAll: Subject<any> = new Subject<any>();
    /**
     * Constructor
     */
    constructor(private _userService:UserService)
    {
    }

    ngOnInit(){
        this._userService.user$
            .pipe(takeUntil(this._unsuscribeAll))
            .subscribe((user:User)=>{
                this.user=user;
                console.log(this.user);
            })
            
    }
}
