import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from './user.types';

@Injectable({ providedIn: 'root' })
export class UserService {
    private _user = new BehaviorSubject<User>({
        id: '',
        name: 'User',
        email: '',
        avatar: undefined,
        status: 'online',
    });

    get user$(): Observable<User> {
        return this._user.asObservable();
    }

    set user(value: Partial<User>) {
        this._user.next({ ...this._user.getValue(), ...value });
    }
}
