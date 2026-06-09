import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Navigation } from './navigation.types';
import { defaultNavigation } from './navigation.data';

@Injectable({ providedIn: 'root' })
export class NavigationService {
    private _navigation = new BehaviorSubject<Navigation>({
        compact: defaultNavigation,
        default: defaultNavigation,
        futuristic: defaultNavigation,
        horizontal: defaultNavigation,
    });

    get navigation$(): Observable<Navigation> {
        return this._navigation.asObservable();
    }
}
