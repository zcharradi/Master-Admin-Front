import { Component, ViewEncapsulation } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'empty-layout',
    template: '<router-outlet></router-outlet>',
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [RouterOutlet],
})
export class EmptyLayoutComponent {}
